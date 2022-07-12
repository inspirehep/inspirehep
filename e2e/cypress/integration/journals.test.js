import { onlyOn } from '@cypress/skip-test';

describe('Journal Submission', () => {
  beforeEach(() => {
    cy.login('cataloger');
  });

  onlyOn('headless', () => {
    it('matches image snapshot', () => {
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
      expectedMetadata,
      formData,
      collection: 'journals',
    });
  });

  afterEach(() => {
    cy.logout();
  });
});
