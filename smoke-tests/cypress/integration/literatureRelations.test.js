describe('Literature and Authors', () => {
  it('literature:search -> literautre:detail -> authors:detail -> authors:publications', () => {
    cy.useDesktop();

    cy.registerRoute('*/literature?*');
    cy.visit('/literature?q=a%20Grit%20Hotzel');
    cy.waitForRoute('*/literature?*');
    cy.waitForSearchResults();

    cy
      .get('[data-test-id="literature-result-title-link"]')
      .first()
      .click()
      .text()
      .as('literature-title');

    cy.registerRoute('**/literature**search_type=hep-author-publication**');

    cy
      .get('[data-test-id="author-link"]')
      .contains('Grit Hotzel')
      .click();

    cy.waitForRoute('**/literature**search_type=hep-author-publication**');
    cy.waitForSearchResults();

    cy
      .get('[data-test-id="literature-result-title-link"]')
      .first()
      .then(title$ => {
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

    cy
      .get('[data-test-id="checkbox-aggregation-option-conference paper"]')
      .click();
    cy.waitForRoute('*/literature?*');
    cy.waitForSearchResults();

    cy
      .get('[data-test-id="literature-conference-link"]')
      .first()
      .closest('[data-test-id="literature-result-item"]')
      .find('[data-test-id="literature-result-title-link"]')
      .invoke('text')
      .as('literature-title');

    cy.registerRoute();

    cy
      .get('[data-test-id="literature-conference-link"]')
      .first()
      .click();

    cy.waitForRoute();
    cy.waitForSearchResults();
    cy.get('[data-test-id="literature-result-title-link"]').then(titles$ => {
      const titles = titles$.toArray().map(title => title.text);
      cy.get('@literature-title').should('be.oneOf', titles);
    });
  });
});
