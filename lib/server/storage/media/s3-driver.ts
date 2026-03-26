import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import type {
  MediaStorageDriver,
  PutStoredMediaObjectInput,
  StoredMediaObject,
} from "./types";

export class S3MediaStorageDriver implements MediaStorageDriver {
  constructor(
    private readonly client: S3Client,
    private readonly bucket: string,
  ) {}

  async putObject(input: PutStoredMediaObjectInput) {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: input.key,
        Body: Buffer.from(input.body),
        ContentType: input.contentType ?? undefined,
      }),
    );
  }

  async readObject(key: string): Promise<StoredMediaObject | null> {
    try {
      const response = await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );

      if (!response.Body) {
        return null;
      }

      const bytes = await response.Body.transformToByteArray();

      return {
        body: bytes,
        contentType: response.ContentType ?? null,
        size:
          typeof response.ContentLength === "number"
            ? response.ContentLength
            : null,
      };
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        ("name" in error &&
          (error.name === "NoSuchKey" || error.name === "NotFound"))
      ) {
        return null;
      }

      throw error;
    }
  }

  async deleteObject(key: string) {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }
}
