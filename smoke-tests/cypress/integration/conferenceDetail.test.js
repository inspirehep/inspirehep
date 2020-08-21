import { onlyOn } from '@cypress/skip-test';

describe('Conference Detail', () => {
  onlyOn('headless', () => {
    it('matches image snapshot', () => {
      cy.registerRoute();
      cy.visit('/conferences/1217045?ui-citation-summary=true');
      cy.waitForRoute();
      cy.waitForSearchResults();
      cy.matchSnapshots('ConferenceDetail');
    });
  });
});
