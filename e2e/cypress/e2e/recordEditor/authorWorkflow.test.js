beforeEach(() => {
  cy.loginAsAdminForBackoffice();
  cy.loginToBackoffice();
});

describe("recordEditor - author workflow", () => {
  it("should enable to save modification and to revert to revision", () => {
    const authorWorkflowId = "ff762952-08c0-485d-9b7d-df41743ac341";
    const authorPreferredName = "Blabla test";

    cy.visit(`/backoffice/authors/${authorWorkflowId}`);

    cy.editWorkflow();
    cy.url().should(
      "include",
      `/editor/backoffice/authors/${authorWorkflowId}`,
    );

    cy.get('[id="root_name_preferred_name"]').click().type(" updated");
    cy.addAward(0, "Nobel", "2026");
    cy.addArxivCategory(/^cond-mat$/);

    cy.contains("button", "Save").click();

    cy.visit(`/backoffice/authors/${authorWorkflowId}`);
    cy.contains(`${authorPreferredName} updated`).should("exist");
    cy.contains("cond-mat").should("exist");
  });
});
