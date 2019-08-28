export function getCurrentAffiliationsFromPositions(positions) {
  return positions
    .filter(position => position.get('current'))
    .map(position => position.get('institution'));
}
