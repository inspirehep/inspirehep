export default function renderAuthorSuggestion(suggestion: any) {
  const name = suggestion._source.name.value;
  const currentPosition = suggestion._source.positions
    .filter((position: any) => position.current)
    .map((position: any) => position.institution)[0];
  if (currentPosition) {
    return `${name} (${currentPosition})`;
  }
  return name;
}
