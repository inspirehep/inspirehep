import { onlyOn } from '@cypress/skip-test';

describe('Conference Search', () => {
  onlyOn('headless', () => {
    it('matches image snapshot', () => {
      cy.registerRoute();
      cy.visit('/conferences?start_date=all');
      cy.waitForRoute();
      cy.waitForSearchResults();
      cy.matchSnapshots('ConferenceSearch');
    });
  });
});
