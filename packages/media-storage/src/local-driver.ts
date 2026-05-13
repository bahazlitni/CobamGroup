import { mkdir, readFile, rm, writeFile } from "fs/promises";
import path from "path";
import type {
  MediaStorageDriver,
  PutStoredMediaObjectInput,
  StoredMediaObject,
} from "./types";

export class LocalMediaStorageDriver implements MediaStorageDriver {
  constructor(private readonly rootDirectory: string) {}

  private resolvePath(key: string) {
    return path.join(this.rootDirectory, key);
  }

  async putObject(input: PutStoredMediaObjectInput) {
    const targetPath = this.resolvePath(input.key);
    await mkdir(path.dirname(targetPath), { recursive: true });
    await writeFile(targetPath, Buffer.from(input.body));
  }

  async readObject(key: string): Promise<StoredMediaObject | null> {
    try {
      const absolutePath = this.resolvePath(key);
      const body = await readFile(absolutePath);

      return {
        body: new Uint8Array(body),
        contentType: null,
        size: body.byteLength,
      };
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        "code" in error &&
        error.code === "ENOENT"
      ) {
        return null;
      }

      throw error;
    }
  }

  async deleteObject(key: string) {
    const absolutePath = this.resolvePath(key);

    try {
      await rm(absolutePath, { force: true });
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        "code" in error &&
        error.code === "ENOENT"
      ) {
        return;
      }

      throw error;
    }
  }
}
