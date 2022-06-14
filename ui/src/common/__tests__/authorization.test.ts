import { List } from 'immutable';

import {
  isAuthorized,
  isCataloger,
  isCatalogerOrBetaUser,
  isSuperUser,
  isBetaUser,
} from '../authorization';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('authorization', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('isAuthorized', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns true if userRoles has one of authorizedRoles', () => {
      const userRoles = List(['common', 'other']);
      const authorizedRoles = List(['common', 'whatever']);
      const result = isAuthorized(userRoles, authorizedRoles);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toBe(true);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns false if userRoles does not have one of authorizedRoles', () => {
      const userRoles = List(['other', 'another']);
      const authorizedRoles = List(['superuser', 'betauser']);
      const result = isAuthorized(userRoles, authorizedRoles);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toBe(false);
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('isCataloger', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns true if userRoles has cataloger role', () => {
      const userRoles = List(['cataloger', 'another']);
      const result = isCataloger(userRoles);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toBe(true);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns true if userRoles has superuser role', () => {
      const userRoles = List(['superuser']);
      const result = isCataloger(userRoles);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toBe(true);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns false if userRoles does not have superuser nor cataloger role', () => {
      const userRoles = List(['other']);
      const result = isCataloger(userRoles);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toBe(false);
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('isBetaUser', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns true if userRoles has betauser role', () => {
      const userRoles = List(['betauser', 'another']);
      const result = isBetaUser(userRoles);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toBe(true);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns true if userRoles has superuser role', () => {
      const userRoles = List(['superuser']);
      const result = isBetaUser(userRoles);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toBe(true);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns false if userRoles does not have superuser nor betauser role', () => {
      const userRoles = List(['other']);
      const result = isBetaUser(userRoles);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toBe(false);
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('isSuperUser', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns true if userRoles has superuser role', () => {
      const userRoles = List(['superuser']);
      const result = isSuperUser(userRoles);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toBe(true);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns false if userRoles does not have superuser role', () => {
      const userRoles = List(['other']);
      const result = isSuperUser(userRoles);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toBe(false);
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('isCatalogerOrBetaUser', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns true if userRoles has cataloger role', () => {
      const userRoles = List(['cataloger', 'another']);
      const result = isCatalogerOrBetaUser(userRoles);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toBe(true);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns true if userRoles has superuser role', () => {
      const userRoles = List(['superuser']);
      const result = isCatalogerOrBetaUser(userRoles);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toBe(true);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns true if userRoles has betauser role', () => {
      const userRoles = List(['betauser']);
      const result = isCatalogerOrBetaUser(userRoles);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toBe(true);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns false if userRoles does not have superuser nor cataloger nor betauser role', () => {
      const userRoles = List(['other']);
      const result = isCatalogerOrBetaUser(userRoles);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toBe(false);
    });
  });
});
