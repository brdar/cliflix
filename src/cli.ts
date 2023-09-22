import { castArray } from "lodash";
import caporal from "caporal";
import updater from "./tiny-updater";
import { name, version } from "../package.json";
import Utils from "./utils";
import ZFlix from ".";

async function CLI() {
  process.on("SIGINT", () => process.exit(1)); // Force quitting

  caporal
    .version(version)
    .argument("[title|torrent]", "Video title or torrent identifier")
    .argument("[-- webtorrent options...]", "WebTorrent options")
    .action(async (args) => {
      await Utils.checkConnection();

      updater({ name, version });

      args = castArray(args.titleTorrent || []).concat(args.webtorrentOptions);

      const doubleDashIndex = args.findIndex((x) => x === "--"),
        hasWebtorrentOptions = doubleDashIndex >= 0,
        queryOrTorrent = hasWebtorrentOptions
          ? args.slice(0, doubleDashIndex).join(" ")
          : args.join(" "),
        webtorrentOptions = hasWebtorrentOptions
          ? args.slice(doubleDashIndex + 1)
          : [];

      if (!queryOrTorrent) return ZFlix.wizard(webtorrentOptions);

      return ZFlix.lucky(queryOrTorrent, webtorrentOptions);
    });

  caporal.parse(process.argv);
}

CLI();
