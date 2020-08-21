import { onlyOn } from '@cypress/skip-test';

describe('Seminar Detail', () => {
  onlyOn('headless', () => {
    it('matches image snapshot', () => {
      cy.registerRoute();
      cy.visit('/seminars/1799778');
      cy.waitForRoute();
      cy.matchSnapshots('SeminarDetail');
    });
  });
});
