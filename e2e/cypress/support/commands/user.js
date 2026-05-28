// user: 'johndoe` (regular user) | 'admin' | 'cataloger'
Cypress.Commands.add("login", (user = "johndoe") => {
  const email = `${user}@inspirehep.net`;
  const password = "123456";
  cy.env(["inspirehep_url"]).then(({ inspirehep_url }) => {
    cy.request({
      url: `${inspirehep_url}/api/accounts/login`,
      method: "POST",
      body: {
        email,
        password,
      },
    });
  });
});

Cypress.Commands.add("logout", () => {
  cy.env(["inspirehep_url"]).then(({ inspirehep_url }) => {
    cy.request(`${inspirehep_url}/api/accounts/logout`);
  });
});
