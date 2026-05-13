export function getMediaMaxUploadBytes() {
  const parsedMegabytes = Number(process.env.MEDIA_MAX_UPLOAD_MB ?? "100");
  const megabytes =
    Number.isFinite(parsedMegabytes) && parsedMegabytes > 0
      ? parsedMegabytes
      : 100;

  return Math.floor(megabytes * 1024 * 1024);
}
