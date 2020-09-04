import { onlyOn } from '@cypress/skip-test';

describe('Experiment Detail', () => {
  onlyOn('headless', () => {
    it('matches image snapshot', () => {
      cy.registerRoute();
      cy.visit('/experiments/1513946?ui-citation-summary=true');
      cy.waitForRoute();
      cy.waitForSearchResults();
      cy.matchSnapshots('ExperimentDetail');
    });
  });
});
