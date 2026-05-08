Cypress.Commands.add("loginAsAdmin", () => {
  const email = "admin@inspirehep.net";
  const password = "123456";
  cy.request({
    url: `${Cypress.env("inspirehep_url")}/api/accounts/login`,
    method: "POST",
    body: {
      email,
      password,
    },
  });
  cy.intercept("GET", "**/accounts/me*").as("accountsMe");
  cy.visit("/", {
    onBeforeLoad(win) {
      win.CONFIG = {
        ...win.CONFIG,
        BACKOFFICE_URL: Cypress.env("backoffice_url"),
      };
    },
  });
  cy.wait("@accountsMe").its("response.statusCode").should("eq", 200);
});

Cypress.Commands.add("loginToBackoffice", () => {
  const email = "admin@admin.com";
  const password = "admin";
  cy.request("POST", `${Cypress.env("backoffice_url")}/api/token/`, {
    email,
    password,
  }).then(({ body }) => {
    expect(body.access).to.be.a("string").and.not.be.empty;
    const token = body.access;

    // Test-only auth injection for backoffice API calls triggered by search flow
    cy.intercept(
      {
        method: "GET",
        url: `${Cypress.env("backoffice_url")}/api/workflows/**`,
        middleware: true,
      },
      (req) => {
        req.headers.authorization = `Bearer ${token}`;
        req.continue();
      },
    ).as("backofficeWorkflowsAuth");

    cy.visit("/backoffice", {
      onBeforeLoad(win) {
        win.__RUNTIME_CONFIG__ = {
          BACKOFFICE_URL: Cypress.env("backoffice_url"),
        };
        win.localStorage.setItem(
          "backoffice.token",
          JSON.stringify(body.access),
        );
        win.localStorage.setItem(
          "backoffice.refreshToken",
          JSON.stringify(body.refresh),
        );
      },
    });
  });
});

Cypress.Commands.add(
  "assertSearchPageIsLoadedWithResults",
  (numberOfResults) => {
    cy.waitForLoading();
    cy.get('[data-testid="backoffice-search-page"]').should("be.visible");
    cy.get('[data-testid="result-from-search"]').should(
      "have.length",
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
