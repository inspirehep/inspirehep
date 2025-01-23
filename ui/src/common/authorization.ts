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

export function isAuthorized(
  userRoles: List<string>,
  authorizedRoles: List<string>
) {
  return doSetsHaveCommonItem(Set(userRoles), Set(authorizedRoles));
}

export function isCataloger(userRoles: List<string>) {
  return isAuthorized(userRoles, SUPERUSER_OR_CATALOGER);
}

export function isCatalogerOrBetaUser(userRoles: List<string>) {
  return isAuthorized(userRoles, SUPERUSER_OR_BETAUSER_OR_CATALOGER);
}

export function isSuperUser(userRoles: List<string>) {
  return isAuthorized(userRoles, SUPERUSER);
}

export function isBetaUser(userRoles: List<string>) {
  return isAuthorized(userRoles, SUPERUSER_OR_BETAUSER);
}
