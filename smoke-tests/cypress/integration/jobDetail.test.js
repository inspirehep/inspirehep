import { onlyOn } from '@cypress/skip-test';

describe('Job Detail', () => {
  onlyOn('headless', () => {
    it('matches image snapshot', () => {
      cy.clock(1688594400000);
      cy.registerRoute();
      cy.visit('/jobs/1812440');
      cy.waitForRoute();
      cy.matchSnapshots('JobDetail');
    });
  });
});
