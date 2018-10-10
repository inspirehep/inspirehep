import { Set } from 'immutable';

import {
  isAuthorized,
  isCataloger,
  isCatalogerOrBetaUser,
  isSuperUser,
} from '../authorization';

describe('authorization', () => {
  describe('isAuthorized', () => {
    it('returns true if userRoles has one of authorizedRoles', () => {
      const userRoles = Set(['common', 'other']);
      const authorizedRoles = Set(['common', 'whatever']);
      const result = isAuthorized(userRoles, authorizedRoles);
      expect(result).toBe(true);
    });

    it('returns false if userRoles does not have one of authorizedRoles', () => {
      const userRoles = Set(['other', 'another']);
      const authorizedRoles = Set(['superuser', 'betauser']);
      const result = isAuthorized(userRoles, authorizedRoles);
      expect(result).toBe(false);
    });
  });

  describe('isCataloger', () => {
    it('returns true if userRoles has cataloger role', () => {
      const userRoles = Set(['cataloger', 'another']);
      const result = isCataloger(userRoles);
      expect(result).toBe(true);
    });

    it('returns true if userRoles has superuser role', () => {
      const userRoles = Set(['superuser']);
      const result = isCataloger(userRoles);
      expect(result).toBe(true);
    });

    it('returns false if userRoles does not have superuser nor cataloger role', () => {
      const userRoles = Set(['other']);
      const result = isCataloger(userRoles);
      expect(result).toBe(false);
    });
  });

  describe('isSuperUser', () => {
    it('returns true if userRoles has superuser role', () => {
      const userRoles = Set(['superuser']);
      const result = isSuperUser(userRoles);
      expect(result).toBe(true);
    });

    it('returns false if userRoles does not have superuser role', () => {
      const userRoles = Set(['other']);
      const result = isSuperUser(userRoles);
      expect(result).toBe(false);
    });
  });

  describe('isCatalogerOrBetaUser', () => {
    it('returns true if userRoles has cataloger role', () => {
      const userRoles = Set(['cataloger', 'another']);
      const result = isCatalogerOrBetaUser(userRoles);
      expect(result).toBe(true);
    });

    it('returns true if userRoles has superuser role', () => {
      const userRoles = Set(['superuser']);
      const result = isCatalogerOrBetaUser(userRoles);
      expect(result).toBe(true);
    });

    it('returns true if userRoles has betauser role', () => {
      const userRoles = Set(['betauser']);
      const result = isCatalogerOrBetaUser(userRoles);
      expect(result).toBe(true);
    });

    it('returns false if userRoles does not have superuser nor cataloger nor betauser role', () => {
      const userRoles = Set(['other']);
      const result = isCatalogerOrBetaUser(userRoles);
      expect(result).toBe(false);
    });
  });
});
