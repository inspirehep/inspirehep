import { Set } from 'immutable';

import { doSetsHaveCommonItem } from './utils';

export const SUPERUSER_OR_BETAUSER_OR_CATALOGER = Set([
  'superuser',
  'betauser',
  'cataloger',
]);
export const SUPERUSER_OR_CATALOGER = Set(['superuser', 'cataloger']);
export const SUPERUSER = Set(['superuser']);
const SUPERUSER_OR_BETAUSER = Set(['superuser', 'betauser']);

export function isAuthorized(userRoles, authorizedRoles) {
  return doSetsHaveCommonItem(userRoles, authorizedRoles);
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
