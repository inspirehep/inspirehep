import { List } from 'immutable';

import {
  isAuthorized,
  isCataloger,
  isCatalogerOrBetaUser,
  isSuperUser,
  isBetaUser,
} from '../authorization';

describe('authorization', () => {
  describe('isAuthorized', () => {
    it('returns true if userRoles has one of authorizedRoles', () => {
      const userRoles = List(['common', 'other']);
      const authorizedRoles = List(['common', 'whatever']);
      const result = isAuthorized(userRoles, authorizedRoles);
      expect(result).toBe(true);
    });

    it('returns false if userRoles does not have one of authorizedRoles', () => {
      const userRoles = List(['other', 'another']);
      const authorizedRoles = List(['superuser', 'betauser']);
      const result = isAuthorized(userRoles, authorizedRoles);
      expect(result).toBe(false);
    });
  });

  describe('isCataloger', () => {
    it('returns true if userRoles has cataloger role', () => {
      const userRoles = List(['cataloger', 'another']);
      const result = isCataloger(userRoles);
      expect(result).toBe(true);
    });

    it('returns true if userRoles has superuser role', () => {
      const userRoles = List(['superuser']);
      const result = isCataloger(userRoles);
      expect(result).toBe(true);
    });

    it('returns false if userRoles does not have superuser nor cataloger role', () => {
      const userRoles = List(['other']);
      const result = isCataloger(userRoles);
      expect(result).toBe(false);
    });
  });

  describe('isBetaUser', () => {
    it('returns true if userRoles has betauser role', () => {
      const userRoles = List(['betauser', 'another']);
      const result = isBetaUser(userRoles);
      expect(result).toBe(true);
    });

    it('returns true if userRoles has superuser role', () => {
      const userRoles = List(['superuser']);
      const result = isBetaUser(userRoles);
      expect(result).toBe(true);
    });

    it('returns false if userRoles does not have superuser nor betauser role', () => {
      const userRoles = List(['other']);
      const result = isBetaUser(userRoles);
      expect(result).toBe(false);
    });
  });

  describe('isSuperUser', () => {
    it('returns true if userRoles has superuser role', () => {
      const userRoles = List(['superuser']);
      const result = isSuperUser(userRoles);
      expect(result).toBe(true);
    });

    it('returns false if userRoles does not have superuser role', () => {
      const userRoles = List(['other']);
      const result = isSuperUser(userRoles);
      expect(result).toBe(false);
    });
  });

  describe('isCatalogerOrBetaUser', () => {
    it('returns true if userRoles has cataloger role', () => {
      const userRoles = List(['cataloger', 'another']);
      const result = isCatalogerOrBetaUser(userRoles);
      expect(result).toBe(true);
    });

    it('returns true if userRoles has superuser role', () => {
      const userRoles = List(['superuser']);
      const result = isCatalogerOrBetaUser(userRoles);
      expect(result).toBe(true);
    });

    it('returns true if userRoles has betauser role', () => {
      const userRoles = List(['betauser']);
      const result = isCatalogerOrBetaUser(userRoles);
      expect(result).toBe(true);
    });

    it('returns false if userRoles does not have superuser nor cataloger nor betauser role', () => {
      const userRoles = List(['other']);
      const result = isCatalogerOrBetaUser(userRoles);
      expect(result).toBe(false);
    });
  });
});
