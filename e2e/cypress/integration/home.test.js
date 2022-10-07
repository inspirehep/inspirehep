import { onlyOn } from '@cypress/skip-test';

describe('Home Page', () => {
  onlyOn('headless', () => {
    it('matches image snapshot', () => {
      cy.registerRoute();
      cy.visit('/');
      cy.waitForRoute();
      cy.waitForLoading();
      cy.matchSnapshots('Homepage');
    });
    
    it('scrolls to How to Search section on button click', () => {
      cy.on('uncaught:exception', () => {
        return false;
      });
      cy.registerRoute();
      cy.visit('/');
      cy.waitForRoute();

      cy.get('[data-test-id="scroll-button"] a').click();
      cy.get('[data-test-id="how-to-search"]').should('be.visible');
    });
  });
});

describe('News and Updates', () => {
  onlyOn('headless', () => {
    it('renders 3 latest blog posts', () => {
      cy.on('uncaught:exception', () => {
        return false;
      });
      cy.registerRoute();
      cy.visit('/');
      cy.waitForRoute();
      cy.waitForLoading();

      cy.get('[data-test-id="news-post"]').as('newsAndUpdates');
      cy.get('@newsAndUpdates').should('have.length', 3);
    });
  });
});
