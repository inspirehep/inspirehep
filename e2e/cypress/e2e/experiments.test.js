import { onlyOn } from '@cypress/skip-test';

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
      expectedMetadata,
      formData,
      collection: 'experiments',
    });
  });

  afterEach(() => {
    cy.logout();
  });
});

describe('Experiment Search', () => {
  onlyOn('headless', () => {
    it('matches image snapshot', () => {
      cy.registerRoute();
      cy.visit('/experiments');
      cy.waitForRoute();
      cy.waitForSearchResults();
      cy.waitForLoading();
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
      cy.waitForLoading();
      cy.matchSnapshots('ExperimentDetail');
    });
  });
});
