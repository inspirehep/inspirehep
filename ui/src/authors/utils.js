export function getCurrentAffiliationsFromPositions(positions) {
  return positions
    .filter(position => position.get('current'))
    .map(position => position.get('institution'));
}

export function getAuthorDisplayName(name) {
  const preferredName = name.get('preferred_name');

  if (preferredName) {
    return preferredName;
  }

  const nameValue = name.get('value');
  const splittedByComma = nameValue.split(', ');
  return splittedByComma.length === 2
    ? `${splittedByComma[1]} ${splittedByComma[0]}`
    : nameValue;
}