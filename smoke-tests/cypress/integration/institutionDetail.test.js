import { onlyOn } from '@cypress/skip-test';

describe('Institution Detail', () => {
  onlyOn('headless', () => {
    it('matches image snapshot', () => {
      cy.registerRoute();
      cy.visit('/institutions/902858?ui-citation-summary=true');
      cy.waitForRoute();
      cy.waitForSearchResults();
      cy.matchSnapshots('InstitutionDetail');
    });
  });
});
