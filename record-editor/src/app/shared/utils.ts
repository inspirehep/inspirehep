export function getSchemaNameFromUrl(schemaUrl: string): string {
  const typeWithFileExt = schemaUrl.slice(
    schemaUrl.lastIndexOf('/') + 1,
    schemaUrl.length
  );
  return typeWithFileExt.slice(0, typeWithFileExt.lastIndexOf('.'));
}
