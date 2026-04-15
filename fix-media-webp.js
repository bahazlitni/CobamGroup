// fix-media-webp-by-storage-path.js
// Usage:
//   node fix-media-webp-by-storage-path.js "C:/dev/cobam-group/.storage/media/media/image/2026/04"
//
// Requires:
//   npm install pg

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const DATABASE_URL = "postgresql://postgres:%5BCobamGroup%5D.%3F.7796%21@localhost:5432/cobamgroup";
const mediaDir = process.argv[2];

if (!DATABASE_URL) {
  console.error("Missing DATABASE_URL in environment.");
  process.exit(1);
}

if (!mediaDir) {
  console.error("Missing media folder path.");
  console.error('Example: node fix-media-webp-by-storage-path.js "C:/dev/cobam-group/.storage/media/media/image/2026/04"');
  process.exit(1);
}

async function main() {
  const client = new Client({
    connectionString: DATABASE_URL,
  });

  await client.connect();

  try {
    const entries = fs.readdirSync(mediaDir, { withFileTypes: true });

    const pairs = [];

    for (const entry of entries) {
      if (!entry.isFile()) continue;

      const fileName = entry.name;

      if (!fileName.endsWith(".webp")) continue;
      if (fileName.endsWith(".thumbnail.webp")) continue;

      const fullPath = path.join(mediaDir, fileName);
      const stats = fs.statSync(fullPath);

      const oldStoragePath = `media/image/2026/04/${fileName.replace(/\.webp$/i, ".png")}`;
      const newStoragePath = `media/image/2026/04/${fileName}`;

      console.log(oldStoragePath)
      console.log(newStoragePath)


      pairs.push({
        old_storage_path: oldStoragePath,
        new_storage_path: newStoragePath,
        size_bytes: stats.size,
      });
    }

    if (pairs.length === 0) {
      console.log("No original .webp files found.");
      return;
    }

    console.log(`Found ${pairs.length} webp originals.`);

    await client.query("BEGIN");

    await client.query(`
      CREATE TEMP TABLE temp_media_updates (
        old_storage_path TEXT PRIMARY KEY,
        new_storage_path TEXT NOT NULL,
        size_bytes BIGINT NOT NULL
      ) ON COMMIT DROP;
    `);

    const chunkSize = 1000;

    for (let i = 0; i < pairs.length; i += chunkSize) {
      const chunk = pairs.slice(i, i + chunkSize);

      const values = [];
      const placeholders = [];

      for (let j = 0; j < chunk.length; j++) {
        const row = chunk[j];
        const base = j * 3;
        placeholders.push(`($${base + 1}, $${base + 2}, $${base + 3})`);
        values.push(row.old_storage_path, row.new_storage_path, row.size_bytes);
      }

      await client.query(
        `
        INSERT INTO temp_media_updates (old_storage_path, new_storage_path, size_bytes)
        VALUES ${placeholders.join(", ")}
        ON CONFLICT (old_storage_path) DO UPDATE
        SET
          new_storage_path = EXCLUDED.new_storage_path,
          size_bytes = EXCLUDED.size_bytes
        `,
        values
      );
    }

    const result = await client.query(`
      UPDATE media AS m
      SET
        size_bytes = t.size_bytes,
        extension = 'webp',
        mime_type = 'image/webp',
        storage_path = t.new_storage_path
      FROM temp_media_updates AS t
      WHERE m.storage_path = t.old_storage_path
        AND m.extension = 'png'
        AND m.storage_path NOT LIKE '%.thumbnail.png'
    `);

    await client.query("COMMIT");

    console.log(`Updated ${result.rowCount} row(s) in media.`);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});