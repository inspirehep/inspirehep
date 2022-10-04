import { onlyOn } from '@cypress/skip-test';
import _ from 'lodash';

describe('Literature and Authors', () => {
  it('literature:search -> literautre:detail -> authors:detail -> authors:publications', () => {
    cy.useDesktop();

    cy.registerRoute('*/literature?*');
    cy.visit('/literature?q=a%20Grit%20Hotzel');
    cy.waitForRoute('*/literature?*');
    cy.waitForSearchResults();

    cy.get('[data-test-id="literature-result-title-link"]')
      .first()
      .click()
      .text()
      .as('literature-title');

    cy.registerRoute('**/literature**search_type=hep-author-publication**');

    cy.get('[data-test-id="author-link"]').contains('Grit Hotzel').click();

    cy.waitForRoute('**/literature**search_type=hep-author-publication**');
    cy.waitForSearchResults();

    cy.get('[data-test-id="literature-result-title-link"]')
      .first()
      .then((title$) => {
        cy.get('@literature-title').should('equal', title$.text());
      });
  });
});

describe('Literature and Conferences', () => {
  it('literature:search -> conferences:detail -> conferences:contributions', () => {
    cy.useDesktop();

    cy.registerRoute('*/literature?*');
    cy.visit('/literature');
    cy.waitForRoute('*/literature?*');

    cy.get(
      '[data-test-id="checkbox-aggregation-option-conference paper"]'
    ).click();
    cy.waitForRoute('*/literature?*');
    cy.waitForSearchResults();

    cy.get('[data-test-id="literature-conference-link"]')
      .first()
      .closest('[data-test-id="literature-result-item"]')
      .find('[data-test-id="literature-result-title-link"]')
      .invoke('text')
      .as('literature-title');

    cy.registerRoute();

    cy.get('[data-test-id="literature-conference-link"]').first().click();

    cy.waitForRoute();
    cy.waitForSearchResults();
    cy.get('[data-test-id="literature-result-title-link"]').then((titles$) => {
      const titles = titles$.toArray().map((title) => title.text);
      cy.get('@literature-title').should('be.oneOf', titles);
    });
  });
});

describe('Assign Conference', () => {
  onlyOn('headless', () => {
    it('matches image snapshot', () => {
      cy.login('admin');
      cy.registerRoute();
      cy.visit('/literature');
      cy.waitForRoute();
      cy.waitForSearchResults();
      cy.waitForLoading();
      cy.get('[data-test-id="search-results"]')
        .children()
        .contains('Correlated Weyl Fermions in Oxides')
        .parentsUntil('[data-test-id="search-results"]')
        .find('[type="checkbox"]')
        .check();
      cy.get('[data-test-id="search-results"]')
        .children()
        .contains('Muon g – 2 theory: The hadronic part')
        .parentsUntil('[data-test-id="search-results"]')
        .find('[type="checkbox"]')
        .check();
      cy.matchSnapshots('assignConferenceChecked', { skipMobile: true });
      cy.get('[type="button"]')
        .contains('tools')
        .trigger('mouseover', { force: true });
      cy.get('[data-test-id="assign-conference"]', { timeout: 5000 }).should(
        'be.visible'
      );
      cy.get('[data-test-id="assign-conference"]').click();
      cy.get('.ant-drawer-content', { timeout: 5000 }).should('be.visible');
      cy.get('.ant-drawer-content').find('[type="button"]').first().click();
      cy.get('.ant-drawer-content')
        .get('[data-test-id="search-results"]', { timeout: 10000 })
        .should('be.visible');
      cy.get('.ant-drawer-content')
        .find('[data-test-id="search-results"]')
        .children()
        .contains('HP2022')
        .parentsUntil('[data-test-id="search-results"]')
        .find('[type="radio"]')
        .check();
      cy.get('[data-test-id="assign-conference-button"]').click();
      cy.wait(3000);

      cy.request({
        url: '/api/literature/1787272',
        failOnStatusCode: false,
      }).then((response) => {
        expect(response).property('status').to.equal(200);
        expect(
          _.find(response.body.metadata.publication_info, { cnum: 'C22-09-25' })
        );
      });
      cy.request({
        url: '/api/literature/1597429',
        failOnStatusCode: false,
      }).then((response) => {
        expect(response).property('status').to.equal(200);
        expect(
          _.find(response.body.metadata.publication_info, { cnum: 'C22-09-25' })
        );
      });
      cy.logout();
    });
  });
});

describe('Export to CDS', () => {
  onlyOn('headless', () => {
    it('check if record has CDS:true', () => {
      cy.login('admin');
      cy.registerRoute();
      cy.visit('/literature');
      cy.waitForRoute();
      cy.waitForSearchResults();
      cy.get('[data-test-id="search-results"]')
        .children()
        .contains('Correlated Weyl Fermions in Oxides')
        .parentsUntil('[data-test-id="search-results"]')
        .find('[type="checkbox"]')
        .check();
      cy.get('[data-test-id="search-results"]')
        .children()
        .contains('Muon g – 2 theory: The hadronic part')
        .parentsUntil('[data-test-id="search-results"]')
        .find('[type="checkbox"]')
        .check();
      cy.get('[type="button"]')
        .contains('tools')
        .trigger('mouseover', { force: true });
      cy.get('[data-test-id="export-to-CDS"]', { timeout: 5000 }).should(
        'be.visible'
      );
      cy.get('[data-test-id="export-to-CDS"]').click();
      cy.get('.ant-modal', { timeout: 5000 }).should('be.visible');
      cy.get('.ant-modal')
        .find('[type="button"]')
        .contains('Confirm')
        .click({ force: true });
      cy.wait(3000);
      cy.get('.ant-notification-notice')
        .contains('Export successful!')
        .should('be.visible');
      cy.request({
        url: '/api/literature/1787272',
        failOnStatusCode: false,
      }).then((response) => {
        expect(response).property('status').to.equal(200);
        expect(_.find(response.body.metadata._export_to, { CDS: true }));
      });
      cy.request({
        url: '/api/literature/1597429',
        failOnStatusCode: false,
      }).then((response) => {
        expect(response).property('status').to.equal(200);
        expect(_.find(response.body.metadata._export_to, { CDS: true }));
      });
      cy.logout();
    });
  });
});
