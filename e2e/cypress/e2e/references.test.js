import { onlyOn, skipOn } from '@cypress/skip-test';

describe('References', () => {
  describe('Reference Search', () => {
    onlyOn('headless', () => {
      it.skip('matches image snapshot for reference search', () => {
        cy.registerRoute();
        cy.visit(
          '/literature?sort=mostrecent&size=25&page=1&q=citedby%3Arecid%3A1322719'
        );
        cy.waitForRoute();
        cy.waitForLoading();
        cy.matchSnapshots('LiteratureReferenceSearch');
      });
    });

    skipOn('electron', () => {
      it('displays references search results if item has references in inspire', () => {
        cy.on('uncaught:exception', () => {
          return false;
        });
  
        cy.registerRoute();
        cy.visit('/literature/1322719');
        cy.waitForRoute();
  
        cy.get('[data-test-id="reference-search-button"]').click();
  
        cy.waitForRoute();
  
        cy.get('[data-test-id="search-results"]')
          .children()
          .should('have.length', 4);
      });
  
      it('displays empty search results if item doesnt have references in inspire', () => {
        cy.on('uncaught:exception', () => {
          return false;
        });
  
        cy.registerRoute();
        cy.visit('/literature/1787272');
        cy.waitForRoute();
  
        cy.get('[data-test-id="reference-search-button"]').click();
  
        cy.get('.ant-empty').should('be.visible');
      });
    });
  });

  describe('Reference container', () => {
    onlyOn('headless', () => {
      it('number of references per page', () => {
        cy.on('uncaught:exception', (err, runnable) => {
          return false;
        });
        cy.registerRoute();
        cy.visit('/literature/1374620');
        cy.waitForRoute();

        cy.get('[data-test-id="pagination-list"]').as('paginationList');
        cy.get('@paginationList')
          .find('.ant-list-items')
          .children()
          .as('referenceListItems');
        cy.get('@paginationList')
          .find('span[class="ant-select-selection-item"]')
          .as('selectionItem');

        cy.get('@referenceListItems').should('have.length', 25);
        cy.get('@selectionItem').should('be.visible');

        cy.get('@paginationList')
          .find('.ant-select-selection-search-input')
          .click({ force: true });
        cy.get('@paginationList')
          .find('div')
          .contains('50 / page')
          .click({ force: true });
        cy.waitForRoute();

        cy.get('@referenceListItems').should('have.length', 50);
        cy.get('@selectionItem').should('be.visible');
        cy.get('a[href="/literature"]').click();
        cy.waitForRoute();

        cy.get('a[href="/literature/1598135"]').click();
        cy.waitForRoute();
        cy.get('@referenceListItems').should('have.length', 50);
      });
    });

    describe('Self curation', () => {
      skipOn('electron', () => {
        it('edit button is disabled when user is not logged in', () => {
          cy.visit('/literature/1688995');
          cy.waitForLoading();
  
          cy.get('[data-test-id="edit-reference"]')
            .first()
            .find('.ant-btn')
            .should('be.disabled');
        });
  
        it('curates reference successfully', () => {
          cy.intercept('POST', '/api/literature/reference-self-curation').as(
            'selfCurationRequest'
          );
  
          cy.login('cataloger');
  
          cy.registerRoute();
          cy.visit('/literature/1688995');
          cy.waitForLoading();
  
          cy.get('[data-test-id="reference-item"]').first().as('referenceItem');
          cy.get('@referenceItem')
            .find('[data-test-id="edit-reference"]')
            .as('editButton');
  
          cy.get('@editButton').click();
  
          cy.get('[data-test-id="reference-embedded-search')
            .find('.ant-input-search-button')
            .click();
          cy.waitForLoading();
  
          cy.get('[data-test-id="reference-drawer-radio-1787272"]').as(
            'radioButton'
          );
  
          cy.get('@radioButton').click();
          cy.get('[data-test-id="curate-button"').click();
  
          cy.waitForLoading();
          cy.wait('@selfCurationRequest');
  
          cy.get('@referenceItem')
            .find('[data-test-id="reference-title"]')
            .as('referenceTitle');
  
          cy.get('.ant-notification-notice-message').should(
            'have.text',
            'Reference Successfully Modified!'
          );
          cy.get('@referenceTitle').should(
            'have.text',
            'Correlated Weyl Fermions in Oxides'
          );
  
          cy.get('@selfCurationRequest')
            .its('request.body')
            .should('contain', { reference_index: 0 });
        });
  
        it('curates reference successfully when page is changed', () => {
          cy.intercept('POST', '/api/literature/reference-self-curation').as(
            'selfCurationRequest'
          );
  
          cy.on('uncaught:exception', () => {
            return false;
          });
  
          cy.login('cataloger');
  
          cy.registerRoute();
          cy.visit('/literature/1688995');
          cy.waitForLoading();
  
          cy.get('.ant-pagination-item-4').click();
  
          cy.waitForRoute();
  
          cy.get('[data-test-id="reference-item"]').eq(12).as('referenceItem');
          cy.get('@referenceItem')
            .find('[data-test-id="edit-reference"]')
            .as('editButton');
  
          cy.get('@editButton').click();
  
          cy.get('[data-test-id="reference-embedded-search')
            .find('.ant-input-search-button')
            .click();
          cy.waitForLoading();
  
          cy.get('[data-test-id="reference-drawer-radio-1688995"]').as(
            'radioButton'
          );
  
          cy.get('@radioButton').click();
          cy.get('[data-test-id="curate-button"').click();
  
          cy.waitForLoading();
          cy.wait('@selfCurationRequest');
  
          cy.get('@referenceItem')
            .find('[data-test-id="reference-title"]')
            .as('referenceTitle');
  
          cy.get('.ant-notification-notice-message').should(
            'have.text',
            'Reference Successfully Modified!'
          );
          cy.get('@referenceTitle').should(
            'have.text',
            'Review of Particle Physics'
          );
        });
  
        it('curates reference successfully when page size is changed', () => {
          cy.intercept('POST', '/api/literature/reference-self-curation').as(
            'selfCurationRequest'
          );
  
          cy.on('uncaught:exception', () => {
            return false;
          });
  
          cy.login('cataloger');
  
          cy.registerRoute();
          cy.visit('/literature/1688995');
          cy.waitForLoading();
  
          cy.get('[data-test-id="pagination-list"]').as('paginationList');
          cy.get('@paginationList')
            .find('.ant-list-items')
            .children()
            .as('referenceListItems');
          cy.get('@paginationList')
            .find('span[class="ant-select-selection-item"]')
            .as('selectionItem');
  
          cy.get('@paginationList')
            .find('.ant-select-selection-search-input')
            .click({ force: true });
          cy.get('@paginationList')
            .find('div')
            .contains('50 / page')
            .click({ force: true });
          cy.waitForRoute();
  
          cy.get('[data-test-id="reference-item"]').eq(38).as('referenceItem');
          cy.get('@referenceItem')
            .find('[data-test-id="edit-reference"]')
            .as('editButton');
  
          cy.get('@editButton').click();
          cy.get('[data-test-id="reference-embedded-search')
            .find('.ant-input-search-button')
            .click();
          cy.waitForLoading();
  
          cy.get('[data-test-id="reference-drawer-radio-1597429"]').as(
            'radioButton'
          );
  
          cy.get('@radioButton').click();
          cy.get('[data-test-id="curate-button"').click();
  
          cy.waitForLoading();
          cy.wait('@selfCurationRequest');
  
          cy.get('@referenceItem')
            .find('[data-test-id="reference-title"]')
            .as('referenceTitle');
  
          cy.get('.ant-notification-notice-message').should(
            'have.text',
            'Reference Successfully Modified!'
          );
          cy.get('@referenceTitle').should(
            'have.text',
            'Muon g – 2 theory: The hadronic part'
          );
        });
  
        it('doesnt curate reference and displays error when error occurs', () => {
          cy.login('cataloger');
  
          cy.intercept('POST', '/api/literature/reference-self-curation', {
            statusCode: 422,
          }).as('getCurationError');
  
          cy.visit('/literature/1688995');
          cy.waitForLoading();
  
          cy.get('[data-test-id="reference-item"]').eq(4).as('referenceItem');
          cy.get('@referenceItem')
            .find('[data-test-id="edit-reference"]')
            .as('editButton');
          cy.get('@referenceItem')
            .find('[data-test-id="reference-title"]')
            .as('referenceTitle');
  
          cy.get('@editButton').click();
          cy.get('[data-test-id="reference-embedded-search')
            .find('.ant-input-search-button')
            .click();
  
          cy.waitForLoading();
  
          cy.get('[data-test-id="reference-drawer-radio-1787272"]').click();
          cy.get('[data-test-id="curate-button"').click();
  
          cy.wait('@getCurationError');
  
          cy.get('.ant-notification-notice-description').should(
            'have.text',
            'Something went wrong.'
          );
          cy.get('@referenceTitle').should(
            'have.text',
            'Numerical Comparisons of Several Algo- rithms for Treating Inconsistent Data in a Least-Squares Adjustment of the Fundamental Constants'
          );
        });
      });
    });
  });
});
