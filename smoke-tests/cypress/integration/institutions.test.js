import { onlyOn } from '@cypress/skip-test';

describe('Institution Detail', () => {
  onlyOn('headless', () => {
    it('matches image snapshot', () => {
      cy.registerRoute();
      cy.visit('/institutions/902858?ui-citation-summary=true');
      cy.waitForRoute();
      cy.waitForSearchResults();
      cy.matchSnapshots('InstitutionDetail');
    });
  });
});

describe('Institutions Editor', () => {
  beforeEach(() => {
    cy.login('cataloger');
  });

  afterEach(() => {
    cy.logout();
  });

  it('edits an institution', () => {
    const RECORD_URL = '/institutions/902858';
    const RECORD_API = `/api${RECORD_URL}`;
    const API = '/api/**';
    const SCHEMAS = '/schemas/**';

    cy.registerRoute(API);
    cy.registerRoute(SCHEMAS);

    cy.visit(`/editor/record${RECORD_URL}`);

    cy.waitForRoute(API);
    cy.waitForRoute(SCHEMAS);

    cy.registerRoute({
      url: RECORD_API,
      method: 'PUT',
    });

    cy.get('[data-path="/legacy_ICN"]').type('Updated by Cypress Test{enter}');
    cy.contains('button', 'Save').click();

    cy.waitForRoute(RECORD_API);

    cy.visit(RECORD_URL);
    cy.waitForRoute(API);
    cy.get('h2').should('contain.text', 'Updated by Cypress');
  });
});
