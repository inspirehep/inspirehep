import { onlyOn } from '@cypress/skip-test';

describe('Job Search', () => {
  onlyOn('headless', () => {
    it('matches image snapshot', () => {
      cy.clock(1688594400000);
      cy.registerRoute();
      cy.visit('/jobs');
      cy.waitForRoute();
      cy.waitForSearchResults();
      cy.matchSnapshots('JobSearch');
    });
  });
});
