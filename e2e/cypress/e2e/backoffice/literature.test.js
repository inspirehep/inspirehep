beforeEach(() => {
  cy.loginAsAdmin();
  cy.loginToBackoffice();
});

describe("New arxiv harvests", () => {
  it("should display new arxiv harvests and enable access to the all list", () => {
    cy.assertCollectionIsVisible("new arxiv harvests");

    cy.get('[data-testid="view-all-new arxiv harvests"]').click();
    cy.assertSearchPageIsLoadedWithResults("21 results");
  });

  it("should display new arxiv harvests and enable access to the running list", () => {
    cy.assertCollectionIsVisible("new arxiv harvests");

    cy.get(
      '[data-testid="collapse-button-new arxiv harvests-in_progress"]',
    ).click();
    cy.get(
      '[data-testid="view-new arxiv harvests-in_progress-running"]',
    ).click();
    cy.assertSearchPageIsLoadedWithResults("10 results");
  });
});

describe("New publisher harvests", () => {
  it("should display new publisher harvests and enable access to the all list", () => {
    cy.assertCollectionIsVisible("new publisher harvests");

    cy.get('[data-testid="view-all-new publisher harvests"]').click();
    cy.assertSearchPageIsLoadedWithResults("8 results");
  });

  it("should display new publisher harvests and enable access to the running list", () => {
    cy.assertCollectionIsVisible("new publisher harvests");

    cy.get(
      '[data-testid="collapse-button-new publisher harvests-in_progress"]',
    ).click();
    cy.get(
      '[data-testid="view-new publisher harvests-in_progress-running"]',
    ).click();
    cy.assertSearchPageIsLoadedWithResults("7 results");
  });
});

describe("Publisher updates", () => {
  it("should display publisher updates and enable access to the all list", () => {
    cy.assertCollectionIsVisible("publisher updates");

    cy.get('[data-testid="view-all-publisher updates"]').click();
    cy.assertSearchPageIsLoadedWithResults("2 results");
  });

  it("should display publisher updates and enable access to the running list", () => {
    cy.assertCollectionIsVisible("publisher updates");

    cy.get(
      '[data-testid="collapse-button-publisher updates-in_progress"]',
    ).click();
    cy.get(
      '[data-testid="view-publisher updates-in_progress-running"]',
    ).click();
    cy.assertSearchPageIsLoadedWithResults("1 result");
  });
});

describe("Arxiv updates", () => {
  it("should display arxiv updates and enable access to the all list", () => {
    cy.assertCollectionIsVisible("arxiv updates");

    cy.get('[data-testid="view-all-arxiv updates"]').click();
    cy.assertSearchPageIsLoadedWithResults("2 results");
  });

  it("should display arxiv updates and enable access to the running list", () => {
    cy.assertCollectionIsVisible("arxiv updates");

    cy.get('[data-testid="collapse-button-arxiv updates-in_progress"]').click();
    cy.get('[data-testid="view-arxiv updates-in_progress-running"]').click();
    cy.assertSearchPageIsLoadedWithResults("1 result");
  });
});

describe("New literature submissions", () => {
  it("should display new literature submissions and enable access to the all list", () => {
    cy.assertCollectionIsVisible("new literature submissions");

    cy.get('[data-testid="view-all-new literature submissions"]').click();
    cy.assertSearchPageIsLoadedWithResults("2 results");
  });

  it("should display new literature submissions and enable access to the running list", () => {
    cy.assertCollectionIsVisible("new literature submissions");

    cy.get(
      '[data-testid="collapse-button-new literature submissions-in_progress"]',
    ).click();
    cy.get(
      '[data-testid="view-new literature submissions-in_progress-running"]',
    ).click();
    cy.assertSearchPageIsLoadedWithResults("1 result");
  });
});

describe("Manual merge", () => {
  it("should display manual merge and enable access to the all list", () => {
    cy.assertCollectionIsVisible("manual merge");

    cy.get('[data-testid="view-all-manual merge"]').click();
    cy.assertSearchPageIsLoadedWithResults("1 result");
  });

  it("should display manual merge and enable access to the approval list", () => {
    cy.assertCollectionIsVisible("manual merge");

    cy.get('[data-testid="collapse-button-manual merge-needs_review"]').click();
    cy.get('[data-testid="view-manual merge-needs_review-approval"]').click();
    cy.assertSearchPageIsLoadedWithResults("1 result");
  });
});
