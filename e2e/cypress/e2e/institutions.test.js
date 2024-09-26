import { onlyOn } from '@cypress/skip-test';

describe('Institution Search', () => {
  onlyOn('headless', () => {
    it.skip('matches image snapshot', () => {
      cy.registerRoute();
      cy.visit('/institutions');
      cy.waitForRoute();
      cy.waitForSearchResults();
      cy.matchSnapshots('InstitutionSearch');
    });
  });
});

describe('Institution Detail', () => {
  onlyOn('headless', () => {
    it.skip('matches image snapshot', () => {
      cy.registerRoute();
      cy.visit('/institutions/902858?ui-citation-summary=true');
      cy.waitForRoute();
      cy.waitForSearchResults();
      cy.matchSnapshots('InstitutionDetail');
    });
  });
});

describe('Institution Submission', () => {
  beforeEach(() => {
    cy.login('cataloger');
  });

  onlyOn('headless', () => {
    it.skip('matches image snapshot', () => {
      cy.visit('/submissions/institutions');
      cy.get('form').should('be.visible');
      cy.matchSnapshots('InstitutionSubmission', { skipMobile: true });
    });
  });

  it('submits a new institution', () => {
    const formData = {
      identifier: 'Amazing New Institution',
    };
    const expectedMetadata = {
      identifier: 'Amazing New Institution',
    };
    cy.visit('/submissions/institutions');
    cy.wait(500);
    cy.testSubmission({
      expectedMetadata: expectedMetadata.identifier,
      formData,
      collection: 'institutions',
      submissionType: 'editor',
    });
  });

  afterEach(() => {
    cy.logout();
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
    cy.on('uncaught:exception', () => {
      return false;
    });

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

    cy.get('[data-path="/institution_hierarchy/0/name"]').type(
      'Updated by Cypress Test{enter}'
    );
    cy.contains('button', 'Save').click();

    cy.waitForRoute(RECORD_API);

    cy.visit(RECORD_URL);
    cy.waitForRoute(API);
    cy.get('span').should('contain.text', 'Updated by Cypress');
  });
});
