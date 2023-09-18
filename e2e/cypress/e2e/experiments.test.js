import { onlyOn, skipOn } from '@cypress/skip-test';

describe('Experiment Search', () => {
  onlyOn('headless', () => {
    it('matches image snapshot', () => {
      cy.registerRoute();
      cy.visit('/experiments');
      cy.waitForRoute();
      cy.waitForSearchResults();
      cy.matchSnapshots('ExperimentSearch');
    });
  });
});

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

describe('Experiment Submission', () => {
  beforeEach(() => {
    cy.login('cataloger');
  });

  onlyOn('headless', () => {
    it('matches image snapshot', () => {
      cy.visit('/submissions/experiments');
      cy.get('form').should('be.visible');
      cy.matchSnapshots('ExperimentSubmission', { skipMobile: true });
    });
  });

  skipOn('electron', () => {
    it('submits a new experiments', () => {
      const formData = {
        project_type: 'collaboration',
        legacy_name: 'Test name',
      };
      const expectedMetadata = {
        project_type: 'collaboration',
        legacy_name: 'Test name',
      };
      cy.visit('/submissions/experiments');
      cy.wait(500);
      cy.testSubmission({
        expectedMetadata: expectedMetadata.legacy_name,
        formData,
        collection: 'experiments',
        submissionType: 'editor'
      });
    });
  });

  afterEach(() => {
    cy.logout();
  });
});
