export default function renderAuthorSuggestion(suggestion) {
  const name = suggestion._source.name.value;
  const currentPosition = suggestion._source.positions
    .filter(position => position.current)
    .map(position => position.institution)[0];
  if (currentPosition) {
    return `${name} (${currentPosition})`;
  }
  return name;
}
