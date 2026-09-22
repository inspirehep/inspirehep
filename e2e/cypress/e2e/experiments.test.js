describe("Experiment Submission", () => {
  beforeEach(() => {
    cy.login("cataloger");
  });

  it("submits a new experiments", () => {
    const formData = {
      project_type: "collaboration",
      legacy_name: "Test name",
    };
    const expectedMetadata = {
      project_type: "collaboration",
      legacy_name: "Test name",
    };
    cy.visit("/submissions/experiments");
    cy.get('[data-test-id="loading"]').should("be.visible");
    cy.waitForLoading();
    cy.testSubmission({
      expectedMetadata: expectedMetadata.legacy_name,
      formData,
      collection: "experiments",
      submissionType: "editor",
    });
  });
});

afterEach(() => {
  cy.logout();
});
