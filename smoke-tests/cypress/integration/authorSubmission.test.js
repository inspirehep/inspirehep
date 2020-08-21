import { onlyOn } from '@cypress/skip-test';

describe('Author Submission', () => {
  beforeEach(() => {
    cy.login('cataloger');
  });

  onlyOn('headless', () => {
    it('matches image snapshot', () => {
      cy.visit('/submissions/authors');
      cy.matchSnapshots('AuthorSubmission', { skipMobile: true });
    });

    it('matches image snapshot for author update', () => {
      cy.registerRoute();
      cy.visit('/submissions/authors/1274753');
      cy.waitForRoute();
      cy.matchSnapshots('AuthorUpdateSubmission', { skipMobile: true });
    });
  });

  afterEach(() => {
    cy.logout();
  });
});
