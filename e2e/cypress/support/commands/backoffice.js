Cypress.Commands.add("loginAsAdminForBackoffice", () => {
  const email = "admin@inspirehep.net";
  const password = "123456";

  cy.env(["backoffice_url"]).then(({ backoffice_url }) => {
    cy.intercept("GET", "/config.js", (req) => {
      req.reply((res) => {
        res.body = res.body
          .replace(
            /BACKOFFICE_URL:\s*'[^']*'/,
            `BACKOFFICE_URL: '${backoffice_url}'`,
          );
      });
    });
  });

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
  cy.intercept("GET", "**/accounts/me*").as("accountsMe");
  cy.visit("/");
  cy.wait("@accountsMe").its("response.statusCode").should("eq", 200);
});

Cypress.Commands.add("loginToBackoffice", () => {
  const email = "admin@admin.com";
  const password = "admin";

  cy.env(["backoffice_url"]).then(({ backoffice_url }) => {
    // sets the backoffice sessionid cookie, sent by the UI on backoffice requests
    cy.request("POST", `${backoffice_url}/api/login/`, {
      email,
      password,
    });
    cy.visit("/backoffice");
  });
});

Cypress.Commands.add(
  "assertSearchPageIsLoadedWithResults",
  (numberOfResults) => {
    cy.waitForLoading();
    cy.get('[data-testid="backoffice-search-page"]').should("be.visible");
    cy.get('[data-testid="number-of-results"]').should(
      "have.text",
      numberOfResults,
    );
  },
);

Cypress.Commands.add("assertCollectionIsVisible", (collectionKey) => {
  cy.get("[data-testid='backoffice-dashboard-page']").should("be.visible");
  cy.get(`[data-testid="${collectionKey}"]`, { timeout: 20000 }).should(
    "be.visible",
  );
});
