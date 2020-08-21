import { onlyOn } from '@cypress/skip-test';

describe('Seminar Search', () => {
  onlyOn('headless', () => {
    it('matches image snapshot', () => {
      cy.registerRoute();
      cy.visit('/seminars?start_date=all');
      cy.waitForRoute();
      cy.waitForSearchResults();
      cy.matchSnapshots('SeminarSearch');
    });
  });
});
