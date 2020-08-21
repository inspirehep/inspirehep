import { onlyOn } from '@cypress/skip-test';

describe('Literature Submission', () => {
  beforeEach(() => {
    cy.login('cataloger');
  });

  onlyOn('headless', () => {
    it('matches image snapshot for article form', () => {
      cy.visit('/submissions/literature');
      cy.selectLiteratureDocType('article');
      cy.matchSnapshots('ArticleSubmission', { skipMobile: true });
    });

    it('matches image snapshot for thesis form', () => {
      cy.visit('/submissions/literature');
      cy.selectLiteratureDocType('thesis');
      cy.matchSnapshots('ThesisSubmission', { skipMobile: true });
    });

    it('matches image snapshot for book form', () => {
      cy.visit('/submissions/literature');
      cy.selectLiteratureDocType('book');
      cy.matchSnapshots('BookSubmission', { skipMobile: true });
    });

    it('matches image snapshot for book chapter form', () => {
      cy.visit('/submissions/literature');
      cy.selectLiteratureDocType('bookChapter');
      cy.matchSnapshots('BookChapterSubmission', { skipMobile: true });
    });
  });

  afterEach(() => {
    cy.logout();
  });
});
