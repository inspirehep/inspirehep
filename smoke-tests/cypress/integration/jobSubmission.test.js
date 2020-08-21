import { onlyOn } from '@cypress/skip-test';

describe('Job Submission', () => {
  beforeEach(() => {
    cy.login('cataloger');
  });

  onlyOn('headless', () => {
    it('matches image snapshot', () => {
      cy.visit('/submissions/jobs');
      cy.matchSnapshots('JobSubmission', { skipMobile: true });
    });

    it('matches image snapshot for Job update', () => {
      cy.registerRoute();
      cy.visit('/submissions/jobs/1812440');
      cy.waitForRoute();
      cy.matchSnapshots('JobUpdateSubmission', { skipMobile: true });
    });
  });

  afterEach(() => {
    cy.logout();
  });
});
