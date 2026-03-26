export type MediaStorageDriverKind = "local" | "s3";

export type StoredMediaObject = {
  body: Uint8Array;
  contentType: string | null;
  size: number | null;
};

export type PutStoredMediaObjectInput = {
  key: string;
  body: Uint8Array;
  contentType: string | null;
};

export type MediaStorageInfo = {
  driver: MediaStorageDriverKind;
  label: string;
  locationLabel: string;
  hint: string;
};

export interface MediaStorageDriver {
  putObject(input: PutStoredMediaObjectInput): Promise<void>;
  readObject(key: string): Promise<StoredMediaObject | null>;
  deleteObject(key: string): Promise<void>;
}
