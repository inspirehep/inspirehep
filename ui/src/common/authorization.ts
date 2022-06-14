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

export function isAuthorized(userRoles, authorizedRoles) {
  return doSetsHaveCommonItem(Set(userRoles), Set(authorizedRoles));
}

export function isCataloger(userRoles) {
  return isAuthorized(userRoles, SUPERUSER_OR_CATALOGER);
}

export function isCatalogerOrBetaUser(userRoles) {
  return isAuthorized(userRoles, SUPERUSER_OR_BETAUSER_OR_CATALOGER);
}

export function isSuperUser(userRoles) {
  return isAuthorized(userRoles, SUPERUSER);
}

export function isBetaUser(userRoles) {
  return isAuthorized(userRoles, SUPERUSER_OR_BETAUSER);
}
