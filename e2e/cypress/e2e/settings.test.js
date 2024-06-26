import { onlyOn } from '@cypress/skip-test';

describe('settings', () => {
  const email = `johnrellis@inspirehep.net`;

  beforeEach(() => {
    cy.login('johnellis');
    cy.visit('/user/settings');
  });

  onlyOn('headless', () => {
    it.skip('matches image snapshot', () => {
      cy.visit('/user/settings');
      cy.wait(10000);
      cy.matchSnapshots('Settings');
    });
  });

  it('enables submit button when email is correct', () => {
    cy.visit('/user/settings');
    cy.wait(10000);

    cy.get('[data-test-id=email]')
      .clear()
      .type(email)
      .get('[data-test-id=submit-email]')
      .should('not.have.attr', 'disabled');
  });

  it('should display validation error when email is incorrect', () => {
    cy.visit('/user/settings');
    cy.wait(10000);

    cy.get('[data-test-id=email]').clear().type('johnrellis@inspirehep').blur();

    cy.get('[data-test-id=email-error]').should('be.visible');
  });

  it('redirects to update author form', () => {
    const recordId = 1010819;

    cy.visit('/user/settings');
    cy.wait(10000);

    cy.get('[data-test-id="author-form"]').click();

    cy.url().should('include', `/submissions/authors/${recordId}`);
  });

  it('exports to orcid', () => {
    cy.visit('/user/settings');
    cy.wait(10000);

    cy.get('[data-test-id="orcid-switch"]').click();
    cy.get('div[class~="ant-popconfirm"]')
      .find('button[class~="ant-btn-primary"]')
      .click();

    cy.reload();
    cy.wait(10000);

    cy.get('[data-test-id="orcid-switch"]').should(
      'have.attr',
      'aria-checked',
      'true'
    );
  });

  it('unexports from orcid', () => {
    cy.visit('/user/settings');
    cy.wait(10000);

    cy.get('[data-test-id="orcid-switch"]').click();
    cy.get('div[class~="ant-popconfirm"]')
      .find('button[class~="ant-btn-primary"]')
      .click();

    cy.reload();
    cy.wait(10000);

    cy.get('[data-test-id="orcid-switch"]').should(
      'have.attr',
      'aria-checked',
      'false'
    );
  });

  it('changes user email', () => {
    cy.visit('/user/settings');
    cy.wait(10000);

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
      .its('response.statusCode')
      .should('equal', 200);
  });
});
