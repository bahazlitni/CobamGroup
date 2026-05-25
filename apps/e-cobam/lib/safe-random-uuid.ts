function fallbackRandomByte() {
  return Math.floor(Math.random() * 256) & 0xff;
}

function randomBytes(length: number) {
  const bytes = new Uint8Array(length);
  const cryptoLike = globalThis.crypto;

  if (cryptoLike && typeof cryptoLike.getRandomValues === "function") {
    cryptoLike.getRandomValues(bytes);
    return bytes;
  }

  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = fallbackRandomByte();
  }

  return bytes;
}

function byteToHex(byte: number) {
  return byte.toString(16).padStart(2, "0");
}

export function safeRandomUUID() {
  const cryptoLike = globalThis.crypto;

  if (cryptoLike && typeof cryptoLike.randomUUID === "function") {
    return cryptoLike.randomUUID();
  }

  const bytes = randomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  return [
    Array.from(bytes.slice(0, 4), byteToHex).join(""),
    Array.from(bytes.slice(4, 6), byteToHex).join(""),
    Array.from(bytes.slice(6, 8), byteToHex).join(""),
    Array.from(bytes.slice(8, 10), byteToHex).join(""),
    Array.from(bytes.slice(10, 16), byteToHex).join(""),
  ].join("-");
}
