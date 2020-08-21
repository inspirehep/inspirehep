import { onlyOn } from '@cypress/skip-test';

describe('Author Detail', () => {
  onlyOn('headless', () => {
    it('matches image snapshot', () => {
      cy.registerRoute();
      cy.visit('/authors/1274753?ui-citation-summary=true');
      cy.waitForRoute();
      cy.waitForSearchResults();
      cy.matchSnapshots('AuthorDetail');
    });
  });
});
