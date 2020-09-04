describe('user', () => {
  it('logs in via local login form and then logs out', () => {
    const username = `cataloger@inspirehep.net`;
    const password = '123456';
    cy.visit('/user/login/local');

    cy.registerRoute({
      url: '/api/accounts/login',
      method: 'POST',
    });

    cy
      .get('[data-test-id=email]')
      .type(username)
      .get('[data-test-id=password]')
      .type(password)
      .get('[data-test-id=login]')
      .click();

    cy
      .waitForRoute('/api/accounts/login')
      .its('status')
      .should('equal', 200);

    cy.registerRoute('/api/accounts/logout');

    cy.get('[data-test-id=logout]').click();

    cy
      .waitForRoute('/api/accounts/logout')
      .its('status')
      .should('equal', 200);
  });
});
