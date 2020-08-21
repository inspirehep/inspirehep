import { onlyOn } from '@cypress/skip-test';

describe('Literature Search', () => {
  onlyOn('headless', () => {
    it('matches image snapshot', () => {
      cy.registerRoute();
      cy.visit('/literature?ui-citation-summary=true');
      cy.waitForRoute();
      cy.waitForSearchResults();
      cy.matchSnapshots('LiteratureSearch');
    });
  });
});
