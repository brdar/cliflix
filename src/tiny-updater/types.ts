export type Options = {
  name: string;
  version: string;
  ttl?: number;
};

export type StoreRecord = {
  timestampFetch: number;
  timestampNotification: number;
  version: string;
};
