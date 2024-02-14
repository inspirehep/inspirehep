describe('Experiment Search', () => {
  it('matches snapshot', () => {
    cy.registerRoute();
    cy.visit('/experiments');
    cy.waitForRoute();
    cy.waitForSearchResults();
    cy.matchSnapshot();
  });
});

describe('Experiment Detail', () => {
  it('matches snapshot', () => {
    cy.registerRoute();
    cy.visit('/experiments/1513946?ui-citation-summary=true');
    cy.waitForRoute();
    cy.waitForSearchResults();
    cy.matchSnapshot();
  });
});

describe('Experiment Submission', () => {
  beforeEach(() => {
    cy.login('cataloger');
  });

  it('matches snapshot', () => {
    cy.visit('/submissions/experiments');
    cy.get('form').should('be.visible');
    cy.matchSnapshot();
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
      expectedMetadata: expectedMetadata.legacy_name,
      formData,
      collection: 'experiments',
      submissionType: 'editor',
    });
  });

  afterEach(() => {
    cy.logout();
  });
});
