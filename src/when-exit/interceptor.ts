import process from "node:process";
import Signals from "./signals";
import type { Callback, Disposer } from "./types";

class Interceptor {
  private callbacks = new Set<Callback>();
  private exited = false;

  constructor() {
    this.hook();
  }

  exit = (signal?: string): void => {
    if (this.exited) return;

    this.exited = true;

    for (const callback of this.callbacks) {
      callback();
    }

    if (signal) {
      process.kill(process.pid, signal);
    }
  };

  hook = (): void => {
    process.once("exit", () => this.exit());

    for (const signal of Signals) {
      process.once(signal, () => this.exit(signal));
    }
  };

  register = (callback: Callback): Disposer => {
    this.callbacks.add(callback);

    return () => {
      this.callbacks.delete(callback);
    };
  };
}

/* EXPORT */

export default new Interceptor();
