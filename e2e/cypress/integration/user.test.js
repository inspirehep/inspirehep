import { onlyOn } from '@cypress/skip-test';

describe('user', () => {
  it('logs in via local login form and then logs out', () => {
    const username = `cataloger@inspirehep.net`;
    const password = '123456';
    cy.visit('/user/login/local');

    cy.registerRoute({
      url: '/api/accounts/login',
      method: 'POST',
    });

    cy.get('[data-test-id=email]')
      .type(username)
      .get('[data-test-id=password]')
      .type(password)
      .get('[data-test-id=login]')
      .click();

    cy.waitForRoute('/api/accounts/login').its('status').should('equal', 200);

    cy.registerRoute('/api/accounts/logout');

    cy.get('[data-test-id=logout]').click();

    cy.waitForRoute('/api/accounts/logout').its('status').should('equal', 200);
  });

  onlyOn('headless', () => {
    it('user session timeout', () => {
      const username = `cataloger@inspirehep.net`;
      const password = '123456';
      cy.clock();
      cy.visit('/user/login/local');

      cy.registerRoute({
        url: '/api/accounts/login',
        method: 'POST',
      });

      cy.get('[data-test-id=email]')
        .type(username)
        .get('[data-test-id=password]')
        .type(password)
        .get('[data-test-id=login]')
        .click();

      cy.waitForRoute('/api/accounts/login').its('status').should('equal', 200);

      cy.clearCookies();
      cy.request({
        url: '/api/accounts/me',
        failOnStatusCode: false,
      })
        .its('status')
        .should('equal', 401);

      cy.window().trigger('mouseover', 'topRight');
      cy.tick(1800000);
      cy.clock().invoke('restore');
      cy.wait(500);
      cy.matchSnapshots('SessionTimeout');
    });
  });
});
