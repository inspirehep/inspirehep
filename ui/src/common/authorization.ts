import { Set, List } from 'immutable';

import { doSetsHaveCommonItem } from './utils';

export const SUPERUSER_OR_BETAUSER_OR_CATALOGER = List([
  'superuser',
  'betauser',
  'cataloger',
]);
export const SUPERUSER_OR_CATALOGER = List(['superuser', 'cataloger']);
export const SUPERUSER = List(['superuser']);
const SUPERUSER_OR_BETAUSER = List(['superuser', 'betauser']);

export function isAuthorized(userRoles: $TSFixMe, authorizedRoles: $TSFixMe) {
  return doSetsHaveCommonItem(Set(userRoles), Set(authorizedRoles));
}

export function isCataloger(userRoles: $TSFixMe) {
  return isAuthorized(userRoles, SUPERUSER_OR_CATALOGER);
}

export function isCatalogerOrBetaUser(userRoles: $TSFixMe) {
  return isAuthorized(userRoles, SUPERUSER_OR_BETAUSER_OR_CATALOGER);
}

export function isSuperUser(userRoles: $TSFixMe) {
  return isAuthorized(userRoles, SUPERUSER);
}

export function isBetaUser(userRoles: $TSFixMe) {
  return isAuthorized(userRoles, SUPERUSER_OR_BETAUSER);
}
