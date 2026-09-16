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
    cy.wait(500);
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
