import { Set } from 'immutable';

import { doSetsHaveCommonItem } from './utils';

const SUPERUSER_OR_BETAUSER_OR_CATALOGER = Set([
  'superuser',
  'betauser',
  'cataloger',
]);
const SUPERUSER_OR_CATALOGER = Set(['superuser', 'cataloger']);
const SUPERUSER = Set(['superuser']);

export const LITERATURE_AUTHORIZED_ROLES = SUPERUSER_OR_BETAUSER_OR_CATALOGER;
export const AUTHORS_AUTHORIZED_ROLES = SUPERUSER;

export function isAuthorized(userRoles, authorizedRoles) {
  return doSetsHaveCommonItem(userRoles, authorizedRoles);
}

export function isCataloger(userRoles) {
  return isAuthorized(userRoles, SUPERUSER_OR_CATALOGER);
}
