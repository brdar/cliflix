import { without } from "lodash";
import OpenSubtitles from "opensubtitles-api";
import parseTorrent from "parse-torrent";
import { resolve } from "path";
import prompt from "inquirer-helpers";
import { colors } from "./tiny-colors";
import torrentSearch from "torrent-search-api";
import ora from "ora";
import Config from "./config";
import Utils from "./utils";
import "./temp";

export class Zflix {
  async wizard(webtorrentOptions: string[] = []) {
    const torrent = await this.getTorrent(),
      magnet = await this.getMagnet(torrent);

    if (!magnet) return console.error(colors.red("Magnet not found."));

    if (
      (Config.subtitles.languages.available.length ||
        Config.subtitles.languages.favorites.length) &&
      !Utils.webtorrent.options.isSubtitlesSet(webtorrentOptions)
    ) {
      const subbed = await prompt.noYes("Do you want subtitles?");

      if (subbed) {
        const languageName = await prompt.list(
            "Which language?",
            Utils.prompt.parseList(
              Config.subtitles.languages.available,
              Config.subtitles.languages.favorites
            )
          ),
          languageCode = Utils.language.getCode(languageName),
          spinner = ora(
            `Waiting for "${colors.bold("OpenSubtitles")}"...`
          ).start(),
          subtitlesAll = await this.getSubtitles(torrent.title, languageCode);

        spinner.stop();

        if (!subtitlesAll.length) {
          const okay = await prompt.noYes(
            `No subtitles found for "${languageName}", play it anyway?`
          );

          if (!okay) return;
        } else {
          const subtitles = await Utils.prompt.subtitles(
              "Which subtitles?",
              subtitlesAll
            ),
            stream = await Utils.subtitles.download(subtitles);

          Utils.webtorrent.options.setSubtitles(webtorrentOptions, stream.path);
        }
      }
    }

    if (
      (Config.outputs.available.length || Config.outputs.favorites.length) &&
      !Utils.webtorrent.options.isAppSet(webtorrentOptions)
    ) {
      const app = await prompt.list(
        "Which app?",
        Utils.prompt.parseList(
          Config.outputs.available,
          Config.outputs.favorites
        )
      );

      webtorrentOptions = Utils.webtorrent.options.setApp(
        webtorrentOptions,
        app
      );
    }

    this.stream(magnet, webtorrentOptions);
  }

  async lucky(queryOrTorrent: string, webtorrentOptions: string[] = []) {
    let torrent = queryOrTorrent;

    try {
      parseTorrent(queryOrTorrent);
    } catch (e) {
      const torrents = await this.getTorrents(queryOrTorrent, 1);

      if (!torrents.length)
        return console.error(
          colors.red(`No torrents found for "${colors.bold(queryOrTorrent)}"`)
        );

      torrent = await this.getMagnet(torrents[0]);

      if (!torrent) return console.error(colors.red("Magnet not found."));
    }

    return this.stream(torrent, webtorrentOptions);
  }

  private async getTorrents(
    query: string,
    rows = Config.torrents.limit,
    provider = Config.torrents.providers.active,
    providers = Config.torrents.providers.available
  ) {
    const hasProvider = !!provider;

    if (!provider) {
      provider = await prompt.list("Which torrents provider?", providers);
    }

    const categories = {
      ThePirateBay: "Video",
      TorrentProject: "Video",
    };

    const category = categories[provider] || "All",
      spinner = ora(`Waiting for "${colors.bold(provider)}"...`).start();

    try {
      torrentSearch.disableAllProviders();
      torrentSearch.enableProvider(provider);

      const torrents = await torrentSearch.search(query, category, rows);

      spinner.stop();

      if (!torrents.length) throw new Error("No torrents found.");

      return torrents;
    } catch (e) {
      spinner.stop();

      console.error(
        colors.yellow(`No torrents found via "${colors.bold(provider)}"`)
      );

      const nextProviders = without(providers, provider),
        nextProvider = hasProvider
          ? providers[providers.indexOf(provider) + 1]
          : "";

      if (!nextProvider && !nextProviders.length) return [];

      return await this.getTorrents(query, rows, nextProvider, nextProviders);
    }
  }

  private async getTorrent() {
    while (true) {
      const query = await prompt.input("What do you want to watch?"),
        torrents = await this.getTorrents(query);

      if (!torrents.length) {
        console.error(
          colors.yellow(
            `No torrents found for "${colors.bold(query)}", try another query.`
          )
        );

        continue;
      }

      return await Utils.prompt.title("Which torrent?", torrents);
    }
  }

  private async getMagnet(torrent: torrentSearch.Torrent) {
    try {
      return await torrentSearch.getMagnet(torrent);
    } catch (e) {
      return;
    }
  }

  private async getSubtitles(query: string, language: string) {
    try {
      const OS = new OpenSubtitles(Config.subtitles.opensubtitles);
      const results = await OS.search({
        sublanguageid: language,
        limit: Config.subtitles.limit,
        query,
      });

      return results[Object.keys(results)[0]] || [];
    } catch (e) {
      return [];
    }
  }

  private async stream(torrent: string, webtorrentOptions: string[] = []) {
    webtorrentOptions = Utils.webtorrent.options.parse(
      webtorrentOptions,
      Config.webtorrent.options
    );

    const { execaSync } = await import("execa");
    const execArgs = ["webtorrent", "download", torrent, ...webtorrentOptions];

    execaSync("npx", execArgs, {
      cwd: resolve(__dirname, ".."),
      stdio: "inherit",
    });
  }
}
