import { onlyOn } from '@cypress/skip-test';

describe('Seminar Submission', () => {
  beforeEach(() => {
    cy.login('cataloger');
  });

  onlyOn('headless', () => {
    it('matches image snapshot', () => {
      cy.visit('/submissions/seminars');
      cy.matchSnapshots('SeminarSubmission', { skipMobile: true });
    });

    it('matches image snapshot for Seminar update', () => {
      cy.registerRoute();
      cy.visit('/submissions/seminars/1799778');
      cy.waitForRoute();
      cy.matchSnapshots('SeminarUpdateSubmission', { skipMobile: true });
    });
  });

  afterEach(() => {
    cy.logout();
  });
});
