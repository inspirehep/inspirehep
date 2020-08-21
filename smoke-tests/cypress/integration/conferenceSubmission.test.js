import { onlyOn } from '@cypress/skip-test';

describe('Conference Submission', () => {
  beforeEach(() => {
    cy.login('cataloger');
  });

  onlyOn('headless', () => {
    it('matches image snapshot', () => {
      cy.visit('/submissions/conferences');
      cy.matchSnapshots('ConferenceSubmission', { skipMobile: true });
    });
  });

  afterEach(() => {
    cy.logout();
  });
});
