import { List, Map } from 'immutable';
import { makeCompliantMetaDescription } from '../common/utils';

export function getCurrentAffiliationsFromPositions(
  positions: Map<string, string>
): Map<string, string> {
  return positions.filter((position) =>
    (position as unknown as Map<string, string>).get('current')
  );
}

export function getAuthorDisplayName(name: Map<string, string>) {
  const preferredName = name.get('preferred_name');

  if (preferredName) {
    return preferredName;
  }

  const nameValue = name.get('value');
  const splittedByComma = (nameValue as string).split(', ');
  return splittedByComma.length === 2
    ? `${splittedByComma[1]} ${splittedByComma[0]}`
    : nameValue;
}

export function getAuthorMetaDescription(author: {
  getIn: (
    arg: string[],
    list: List<string>
  ) => { get: (arg: string) => string }[];
  get: (arg: string, list: List<string>) => Map<string, string>;
}) {
  const ITEM_SEPARATOR = ' and ';

  const nativeNamesText = author
    .getIn(['name', 'native_names'], List())
    .filter(Boolean)
    .join(ITEM_SEPARATOR);
  const affiliationsText = getCurrentAffiliationsFromPositions(
    author.get('positions', List([]))
  )
    .map((position) =>
      (position as unknown as Map<string, string>).get('institution')
    )
    .filter(Boolean)
    .join(ITEM_SEPARATOR);
  const categoriesText = author
    .get('arxiv_categories', List())
    .filter(Boolean)
    .join(ITEM_SEPARATOR);
  const experimentsText = author
    .get('project_membership', List())
    .map((experiment) =>
      (experiment as unknown as Map<string, string>).get('name')
    )
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

export function getInspireId(ids: List<Map<string, string>>) {
  return ids
    .filter((item) => item.get('schema') === 'INSPIRE ID')
    ?.first()
    ?.get('value');
}
