export type Entry = readonly [key: string, value: string];

export type Backend = {
  read(id: string): readonly Entry[];
  write(id: string, data: IterableIterator<Entry>): void;
};

export type Options = {
  id: string;
  backend: Backend;
};
