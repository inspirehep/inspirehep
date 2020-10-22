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

    cy.registerRoute(API);

    cy.visit(`/editor/record${RECORD_URL}`);

    cy.waitForRoute(API);

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

  it.only('does not save stale institution', () => {
    const RECORD_URL = '/institutions/902858';
    const RECORD_API = `/api${RECORD_URL}`;
    const RECORD_AND_SCHEMA_API = `/api/editor${RECORD_URL}`;
    const API = '/api/**';

    cy.registerRoute(RECORD_AND_SCHEMA_API);

    cy.visit(`/editor/record${RECORD_URL}`);

    cy.waitForRoute(RECORD_AND_SCHEMA_API).then(xhr => {
      // Do a PUT right after GETing record data to make it stale (by increasing the revision)
      cy
        .request({
          url: `${Cypress.env('inspirehep_url')}/api${RECORD_URL}`,
          method: 'PUT',
          body: xhr.response.body.record.metadata,
        })
        .its('status')
        .should('equal', 200);
    });

    cy.registerRoute({
      url: RECORD_API,
      method: 'PUT',
    });

    cy
      .get('[data-path="/legacy_ICN"]')
      .type('Stale Update by Cypress Test{enter}');
    cy.contains('button', 'Save').click();

    cy.waitForRoute(RECORD_API).then(xhr => {
      // Check Precondition for SAVE failed (revision does not match)
      cy
        .wrap(xhr)
        .its('status')
        .should('equal', 412);
    });

    cy.registerRoute(API);

    cy.visit(RECORD_URL);

    cy.waitForRoute(API);

    // Check if record is actually not modified just in case
    cy.get('h2').should('not.contain.text', 'Stale Update by Cypress Test');
  });
});
