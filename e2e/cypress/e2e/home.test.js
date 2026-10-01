describe("Home Page", () => {
  it("scrolls to How to Search section on button click", () => {
    cy.on("uncaught:exception", () => {
      return false;
    });
    cy.registerRoute();
    cy.visit("/");
    cy.waitForRoute();

    cy.get('[data-testid="scroll-button"]').click();
    cy.get('[data-testid="how-to-search"]').should("be.visible");
  });
});

describe("News and Updates", () => {
  if (Cypress.browser.isHeadless) {
    it("renders 3 latest blog posts", () => {
      cy.on("uncaught:exception", () => {
        return false;
      });
      cy.registerRoute();
      cy.visit("/");
      cy.waitForRoute();
      cy.waitForLoading(80000);

      cy.get('[data-testid="news-post"]').as("newsAndUpdates");
      cy.get("@newsAndUpdates").should("have.length", 3);
    });
  }
});
