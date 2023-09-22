import { NodeStore } from "../ionstore/node";
import Utils from "./utils";
import type { StoreRecord } from "./types";

class Store {
  private store = new NodeStore("tiny-updater");

  get = (name: string): StoreRecord | undefined => {
    try {
      const recordRaw = this.store.get(name);

      if (!recordRaw) return;

      const record = JSON.parse(recordRaw);

      if (!Utils.isNumber(record.timestampFetch)) return;
      if (!Utils.isNumber(record.timestampNotification)) return;
      if (!Utils.isString(record.version)) return;

      return record;
    } catch {
      return;
    }
  };

  set = (name: string, record: StoreRecord): void => {
    this.store.set(name, JSON.stringify(record));
  };
}

export default new Store();
