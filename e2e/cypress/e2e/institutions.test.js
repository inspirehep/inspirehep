describe("Institution Submission", () => {
  beforeEach(() => {
    cy.login("cataloger");
  });

  it("submits a new institution", () => {
    const formData = {
      identifier: "Amazing New Institution",
    };
    const expectedMetadata = {
      identifier: "Amazing New Institution",
    };
    cy.visit("/submissions/institutions");
    cy.get('[data-test-id="loading"]').should("be.visible");
    cy.waitForLoading();
    cy.testSubmission({
      expectedMetadata: expectedMetadata.identifier,
      formData,
      collection: "institutions",
      submissionType: "editor",
    });
  });

  afterEach(() => {
    cy.logout();
  });
});

describe("Institutions Editor", () => {
  beforeEach(() => {
    cy.login("cataloger");
  });

  afterEach(() => {
    cy.logout();
  });

  it("edits an institution", () => {
    cy.on("uncaught:exception", () => {
      return false;
    });

    const RECORD_URL = "/institutions/902858";
    const RECORD_API = `/api${RECORD_URL}`;
    const API = "/api/**";

    cy.registerRoute(API);

    cy.visit(`/editor/record${RECORD_URL}`);

    cy.waitForRoute(API);

    cy.registerRoute({
      url: RECORD_API,
      method: "PUT",
    });

    cy.get('[data-path="/institution_hierarchy/0/name"]').type(
      "Updated by Cypress Test{enter}",
    );
    cy.contains("button", "Save").click();

    cy.waitForRoute(RECORD_API);

    cy.visit(RECORD_URL);
    cy.waitForRoute(API);
    cy.get("span").should("contain.text", "Updated by Cypress");
  });
});
