import { onlyOn } from '@cypress/skip-test';

describe('Author Search', () => {
  onlyOn('headless', () => {
    it('matches image snapshot', () => {
      cy.registerRoute();
      cy.visit('/authors');
      cy.waitForRoute();
      cy.waitForSearchResults();
      cy.matchSnapshots('AuthorSearch');
    });
  });
});
