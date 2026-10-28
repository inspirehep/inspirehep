Cypress.Commands.add("loginAsAdmin", () => {
  const email = "admin@inspirehep.net";
  const password = "123456";
  cy.intercept("GET", "/config.js", (req) => {
    req.reply((res) => {
      res.body = res.body.replace(
        /RECORD_EDITOR_AUTHOR_FEATURE_FLAG:\s*(true|false)/,
        "RECORD_EDITOR_AUTHOR_FEATURE_FLAG: true",
      );
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

Cypress.Commands.add("editRecord", (recordId) => {
  cy.get(`[data-testid="edit-record-${recordId}"]`)
    .invoke("removeAttr", "target")
    .click();
});

Cypress.Commands.add("addPositionAtCern", (index, endDate, rank) => {
  cy.get('[data-testid="positions"]').click();
  cy.contains(
    ".ant-dropdown:not(.ant-dropdown-hidden) button",
    "Add new",
  ).click();
  cy.get(`[id="root_positions_${index}_institution"]`).type("C");
  cy.contains("CERN").click();
  cy.get(`[id="root_positions_${index}_end_date"]`).type(endDate);
  cy.get(`[id="root_positions_${index}_rank"]`).click();
  cy.contains(rank).click();
});

Cypress.Commands.add("addAward", (index, name, year) => {
  cy.get('[data-testid="awards"]').click();
  cy.contains(
    ".ant-dropdown:not(.ant-dropdown-hidden) button",
    "Add new",
  ).click();
  cy.get(`[id="root_awards_${index}_name"]`).type(name);
  cy.get(`[id="root_awards_${index}_year"]`).type(year);
});

Cypress.Commands.add("addArxivCategory", (category) => {
  cy.get('[data-testid="arxiv categories"]')
    .closest(".record-editor-field")
    .find(".ant-select")
    .click();
  cy.contains(category).click();
  cy.get('[data-testid="arxiv categories"]')
    .closest(".record-editor-field")
    .find(".ant-select")
    .click();
});
