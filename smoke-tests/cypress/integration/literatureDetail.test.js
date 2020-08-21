import { onlyOn } from '@cypress/skip-test';

describe('Literature Detail', () => {
  onlyOn('headless', () => {
    it('matches image snapshot', () => {
      cy.registerRoute();
      cy.visit('/literature/1235543');
      cy.waitForRoute();
      cy.matchSnapshots('LiteratureDetail');
    });
  });
});
