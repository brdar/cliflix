import process from "node:process";

export const IS_LINUX = process.platform === "linux";
export const IS_WINDOWS = process.platform === "win32";
