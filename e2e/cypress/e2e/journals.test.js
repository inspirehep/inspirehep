describe("Journal Submission", () => {
  beforeEach(() => {
    cy.login("cataloger");
  });

  it("submits a new journal", () => {
    const formData = {
      journal_title: "Amazing Journal",
      short_title: "AJ",
    };
    const expectedMetadata = {
      journal_title: "Amazing Journal",
      short_title: "AJ",
    };
    cy.visit("/submissions/journals");
    cy.testSubmission({
      expectedMetadata: expectedMetadata.short_title,
      formData,
      collection: "journals",
      submissionType: "editor",
    });
  });

  afterEach(() => {
    cy.logout();
  });
});
