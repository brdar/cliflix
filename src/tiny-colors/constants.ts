const ENV = globalThis.process?.env || {};
const ARGV = globalThis.process?.argv || [];

export const IS_ENABLED =
  !("NO_COLOR" in ENV) &&
  ENV.TERM !== "dumb" &&
  !ARGV.includes("--no-color") &&
  !ARGV.includes("--no-colors") &&
  (!globalThis.process?.stdout || globalThis.process?.stdout?.isTTY === true);
