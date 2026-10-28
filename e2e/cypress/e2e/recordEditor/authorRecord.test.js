beforeEach(() => {
  cy.loginAsAdmin();
});

describe("recordEditor - authorRecord", () => {
  it("should enable to save modification and to revert to revision", () => {
    const authorRecordId = 1014937;
    const authorPreferredName = "David Lyle Burke";
    cy.intercept("GET", "**/api/literature?*").as("publications");
    cy.intercept("GET", "**/api/literature/facets*").as("facets");
    cy.intercept("PUT", "**/api/editor/authors/*/revisions/revert").as("revert");
    cy.visit(`/authors/${authorRecordId}`);
    // Firefox aborts in-flight requests on navigation, wait for the page to settle
    cy.wait("@publications");
    cy.wait(["@facets", "@facets"]);
    cy.editRecord(authorRecordId);
    cy.url().should("include", `/new-editor/record/authors/${authorRecordId}`);

    cy.get('[id="root_name_preferred_name"]').click().type(" updated");
    cy.addPositionAtCern(3, 1970, "MASTER");
    cy.addAward(0, "Nobel", "2026");
    cy.addArxivCategory(/^cond-mat$/);

    cy.contains("button", "Save").click();
    cy.url().should("not.include", "new-editor");
    cy.contains(`${authorPreferredName} updated`).should("exist");
    cy.contains("cond-mat").should("exist");
    cy.contains("Show all positions").click();
    cy.contains("CERN").should("exist");

    cy.editRecord(authorRecordId);

    cy.contains("Last edit").click();
    cy.contains("On").click();
    cy.contains("Revert to").click();
    cy.wait("@revert").its("response.statusCode").should("eq", 200);

    cy.visit(`/authors/${authorRecordId}`);

    cy.contains(`${authorPreferredName} updated`).should("not.exist");
    cy.contains(`${authorPreferredName}`).should("exist");
    cy.contains("cond-mat").should("not.exist");
    cy.contains("Show all positions").should("not.exist");
    cy.contains("CERN").should("not.exist");
  });
});
