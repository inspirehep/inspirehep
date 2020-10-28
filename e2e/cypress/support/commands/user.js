// user: 'johndoe` (regular user) | 'admin' | 'cataloger'
Cypress.Commands.add('login', (user = 'johndoe') => {
  const email = `${user}@inspirehep.net`;
  const password = '123456';
  cy.request({
    url: `${Cypress.env('inspirehep_url')}/api/accounts/login`,
    method: 'POST',
    body: {
      email,
      password,
    },
  });
});

Cypress.Commands.add('logout', () => {
  cy.request(`${Cypress.env('inspirehep_url')}/api/accounts/logout`);
});
