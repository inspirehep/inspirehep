describe('Journal Detail', () => {
  it('matches snapshot', () => {
    cy.registerRoute();
    cy.visit('/journals/1213103');
    cy.waitForRoute();
    cy.waitForSearchResults();
    cy.waitForLoading();
    cy.matchSnapshot();
  });
});

describe('Journal Search', () => {
  it('matches snapshot', () => {
    cy.registerRoute();
    cy.visit('/journals');
    cy.waitForRoute();
    cy.waitForSearchResults();
    cy.waitForLoading();
    cy.matchSnapshot();
  });
});

describe('Journal Submission', () => {
  beforeEach(() => {
    cy.login('cataloger');
  });

  it('matches snapshot', () => {
    cy.visit('/submissions/journals');
    cy.get('form').should('be.visible');
    cy.matchSnapshot();
  });

  it('submits a new journal', () => {
    const formData = {
      journal_title: 'Amazing Journal',
      short_title: 'AJ',
    };
    const expectedMetadata = {
      journal_title: 'Amazing Journal',
      short_title: 'AJ',
    };
    cy.visit('/submissions/journals');
    cy.testSubmission({
      expectedMetadata: expectedMetadata.short_title,
      formData,
      collection: 'journals',
      submissionType: 'editor',
    });
  });

  afterEach(() => {
    cy.logout();
  });
});
