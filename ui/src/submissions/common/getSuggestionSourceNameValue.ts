export default function renderAuthorSuggestion(suggestion: $TSFixMe) {
  const name = suggestion._source.name.value;
  const currentPosition = suggestion._source.positions
    .filter((position: $TSFixMe) => position.current)
    .map((position: $TSFixMe) => position.institution)[0];
  if (currentPosition) {
    return `${name} (${currentPosition})`;
  }
  return name;
}
