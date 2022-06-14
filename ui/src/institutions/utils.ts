import { List } from 'immutable';
import { makeCompliantMetaDescription } from '../common/utils';

export function getPapersQueryString(recordId: $TSFixMe) {
  return `affid ${recordId}`;
}

function getAddressText(address: $TSFixMe) {
  const postalAddresses = address.get('postal_address', List());
  const country = address.get('country');
  const postalAddress = postalAddresses.join(', ');
  const addressElements = [postalAddress, country];
  const addressText = addressElements.filter(Boolean).join(', ');
  return addressText;
}

function getInstitutionHierarchiesText(hierarchy: $TSFixMe) {
  const name = hierarchy.get('name');
  const acronym = hierarchy.get('acronym');
  const hierarchyElements = [name, acronym ? `(${acronym})` : null];
  const hierarchyText = hierarchyElements.filter(Boolean).join(' ');
  return hierarchyText;
}

const ITEM_SEPARATOR = ' and ';
export function getInstitutionMetaDescription(institution: $TSFixMe) {
  const legacyICNText = institution.get('legacy_ICN');
  const institutionHierarchiesText = institution
    .get('institution_hierarchy', List())
    .map((hierarchy: $TSFixMe) => getInstitutionHierarchiesText(hierarchy))
    .filter(Boolean)
    .join(ITEM_SEPARATOR);
  const addressText = institution
    .get('addresses', List())
    .map((address: $TSFixMe) => getAddressText(address))
    .filter(Boolean)
    .join(ITEM_SEPARATOR);

  const sentences = [legacyICNText, institutionHierarchiesText, addressText];

  const description = sentences.filter(Boolean).join('. ');

  return makeCompliantMetaDescription(description);
}
