import { List } from 'immutable';
import { makeCompliantMetaDescription } from '../common/utils';

export function getCurrentAffiliationsFromPositions(positions) {
  return positions.filter(position => position.get('current'));
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

export function getAuthorMetaDescription(author) {
  const ITEM_SEPARATOR = ' and ';

  const nativeNamesText = author
    .getIn(['name', 'native_names'], List())
    .filter(Boolean)
    .join(ITEM_SEPARATOR);
  const affiliationsText = getCurrentAffiliationsFromPositions(
    author.get('positions', List([]))
  )
    .map(position => position.get('institution'))
    .filter(Boolean)
    .join(ITEM_SEPARATOR);
  const categoriesText = author
    .get('arxiv_categories', List())
    .filter(Boolean)
    .join(ITEM_SEPARATOR);
  const experimentsText = author
    .get('project_membership', List())
    .map(experiment => experiment.get('name'))
    .filter(Boolean)
    .join(ITEM_SEPARATOR);

  const sentences = [
    nativeNamesText,
    affiliationsText,
    categoriesText,
    experimentsText,
  ];

  const description = sentences.filter(Boolean).join('. ');

  return makeCompliantMetaDescription(description);
}
