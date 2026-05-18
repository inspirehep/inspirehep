Cypress.Commands.add("loginAsAdmin", () => {
  const email = "admin@inspirehep.net";
  const password = "123456";
  const backofficeUrl = Cypress.env("backoffice_url");

  cy.intercept("GET", "/config.js", (req) => {
    req.reply((res) => {
      res.body = res.body
        .replace(
          /BACKOFFICE_URL:\s*'[^']*'/,
          `BACKOFFICE_URL: '${backofficeUrl}'`,
        )
        .replace(
          /BACKOFFICE_LITERATURE_FEATURE_FLAG:\s*\w+/,
          "BACKOFFICE_LITERATURE_FEATURE_FLAG: true",
        );
    });
  });

  cy.request({
    url: `${Cypress.env("inspirehep_url")}/api/accounts/login`,
    method: "POST",
    body: {
      email,
      password,
    },
  });
  cy.intercept("GET", "**/accounts/me*").as("accountsMe");
  cy.visit("/");
  cy.wait("@accountsMe").its("response.statusCode").should("eq", 200);
});

Cypress.Commands.add("loginToBackoffice", () => {
  const email = "admin@admin.com";
  const password = "admin";
  const backofficeUrl = Cypress.env("backoffice_url");

  cy.request("POST", `${backofficeUrl}/api/token/`, {
    email,
    password,
  }).then(({ body }) => {
    expect(body.access).to.be.a("string").and.not.be.empty;
    const token = body.access;

    cy.intercept(
      {
        method: "GET",
        url: `${backofficeUrl}/api/workflows/**`,
        middleware: true,
      },
      (req) => {
        req.headers.authorization = `Bearer ${token}`;
        req.continue();
      },
    ).as("backofficeWorkflowsAuth");

    cy.visit("/backoffice", {
      onBeforeLoad(win) {
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
