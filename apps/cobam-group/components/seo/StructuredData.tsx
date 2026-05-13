type StructuredDataProps = {
  data: unknown | unknown[] | null | undefined;
};

export default function StructuredData({ data }: StructuredDataProps) {
  const entries = (Array.isArray(data) ? data : [data]).filter(
    (entry): entry is Record<string, unknown> =>
      entry != null && typeof entry === "object" && !Array.isArray(entry),
  );

  if (entries.length === 0) {
    return null;
  }

  return (
    <>
      {entries.map((entry, index) => (
        <script
          key={`structured-data-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(entry),
          }}
        />
      ))}
    </>
  );
}
