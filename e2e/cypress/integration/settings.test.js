import { onlyOn } from '@cypress/skip-test';

describe('settings', () => {
  beforeEach(() => {
    cy.login('johnellis');
    cy.visit('/user/settings');
  });

  onlyOn('headless', () => {
    it('matches image snapshot', () => {
      cy.visit('/user/settings');
      cy.matchSnapshots('Settings');
    });
  });

  it('enables submit button when email is correct', () => {
    const email = `johnrellis@inspirehep.net`;

    cy.visit('/user/settings');

    cy.get('[data-test-id=email]')
      .clear()
      .type(email)
      .get('[data-test-id=submit-email]')
      .should('not.have.attr', 'disabled');
  });

  it('should display validation error when email is incorrect', () => {
    const email = `johnrellis@inspirehep`;

    cy.visit('/user/settings');

    cy.get('[data-test-id=email]')
      .clear()
      .type(email)
      .blur();
      
    cy.get('[data-test-id=email-error]').should('be.visible');
  });

  it('redirects to update author form', () => {
    const recordId = 1010819;

    cy.visit('/user/settings');

    cy.get('[data-test-id="author-form"]').click();

    cy.url().should('include', `/submissions/authors/${recordId}`);
  });

  it('exports to orcid', () => {
    cy.visit('/user/settings');

    cy.get('[data-test-id="orcid-switch"]').click();
    cy.get('div[class~="ant-popconfirm"]').find('button[class~="ant-btn-primary"]').click();

    cy.reload();

    cy.get('[data-test-id="orcid-switch"]').should('have.attr', 'aria-checked', 'true');
  });

  it('unexports from orcid', () => {
    cy.visit('/user/settings');

    cy.get('[data-test-id="orcid-switch"]').click();
    cy.get('div[class~="ant-popconfirm"]').find('button[class~="ant-btn-primary"]').click();

    cy.reload();

    cy.get('[data-test-id="orcid-switch"]').should('have.attr', 'aria-checked', 'false');
  });

  it('changes user email', () => {
    const email = `johnrellis@inspirehep.net`;

    cy.visit('/user/settings');

    cy.registerRoute({
      url: '/api/accounts/settings/update-email',
      method: 'POST',
    });

    cy.get('[data-test-id=email]')
      .clear()
      .type(email)
      .get('[data-test-id=submit-email]')
      .click();

    cy.waitForRoute('/api/accounts/settings/update-email')
      .its('status')
      .should('equal', 200);
  });
});
