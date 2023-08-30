import { onlyOn } from '@cypress/skip-test';

describe('Journal Detail', () => {
  onlyOn('headless', () => {
    it.skip('matches image snapshot', () => {
      cy.registerRoute();
      cy.visit('/journals/1213103');
      cy.waitForRoute();
      cy.waitForSearchResults();
      cy.waitForLoading();
      cy.matchSnapshots('JournalDetail');
    });
  });
});

describe('Journal Search', () => {
  onlyOn('headless', () => {
    it.skip('matches image snapshot', () => {
      cy.registerRoute();
      cy.visit('/journals');
      cy.waitForRoute();
      cy.waitForSearchResults();
      cy.waitForLoading();
      cy.matchSnapshots('JournalsSearch');
    });
  });
});

describe('Journal Submission', () => {
  beforeEach(() => {
    cy.login('cataloger');
  });

  onlyOn('headless', () => {
    it.skip('matches image snapshot', () => {
      cy.visit('/submissions/journals');
      cy.get('form').should('be.visible');
      cy.matchSnapshots('JournalSubmission', { skipMobile: true });
    });
  });

  it('submits a new journal', () => {
    const formData = {
      journal_title: 'Amazing Journal',
      short_title: 'AJ'
    };
    const expectedMetadata = {
      journal_title: 'Amazing Journal',
      short_title: 'AJ'
    };
    cy.visit('/submissions/journals');
    cy.testSubmission({
      expectedMetadata: expectedMetadata.short_title,
      formData,
      collection: 'journals',
      submissionType: 'editor'
    });
  });

  afterEach(() => {
    cy.logout();
  });
});
