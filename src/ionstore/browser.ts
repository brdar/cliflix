import { AbstractStore } from "./abstract";

export class BrowserStore extends AbstractStore {
  constructor(id: string) {
    super({
      id,
      backend: {
        read: (id: string) => {
          return JSON.parse(sessionStorage.getItem(id) || "[]");
        },
        write: (id: string, data) => {
          return sessionStorage.setItem(id, JSON.stringify(Array.from(data)));
        },
      },
    });
  }
}
