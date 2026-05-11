beforeEach(() => {
  cy.loginAsAdmin();
  cy.loginToBackoffice();
});

describe("New authors", () => {
  it("should display new authors and enable access to the all authors list", () => {
    cy.assertCollectionIsVisible("new authors");

    cy.get('[data-testid="view-all-new authors"]').click();
    cy.assertSearchPageIsLoadedWithResults(3);
  });

  it("should display new authors and enable access to the running authors list", () => {
    cy.assertCollectionIsVisible("new authors");

    cy.get('[data-testid="collapse-button-new authors-in_progress"]').click();
    cy.get('[data-testid="view-new authors-in_progress-running"]').click();
    cy.assertSearchPageIsLoadedWithResults(2);
  });
});

describe("Update authors", () => {
  it("should display update authors and enable access to the all authors list", () => {
    cy.assertCollectionIsVisible("author updates");

    cy.get('[data-testid="view-all-author updates"]').click();
    cy.assertSearchPageIsLoadedWithResults(2);
  });

  it("should display update authors and enable access to the running authors list", () => {
    cy.assertCollectionIsVisible("author updates");

    cy.get(
      '[data-testid="collapse-button-author updates-in_progress"]',
    ).click();
    cy.get('[data-testid="view-author updates-in_progress-running"]').click();
    cy.assertSearchPageIsLoadedWithResults(1);
  });
});
