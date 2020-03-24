describe('Literature and Authors', () => {
  it('literature:search -> literautre:detail -> authors:detail -> authors:publications', () => {
    cy.useDesktop();
    // TODO: override `visit` use this as a base url
    cy.visit('/');
    cy.get('[data-test-id="search-box-input"]').type('a edward witten{enter}');

    cy.selectFromDropdown('sort-by-select', 'mostcited');

    cy
      .get('[data-test-id="literature-result-title-link"]')
      .first()
      .click()
      .text()
      .as('literature-title');

    cy
      .get('[data-test-id="author-link"]')
      .first()
      .click();

    cy.selectFromDropdown('sort-by-select', 'mostcited');

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
    cy.visit('/');

    cy.get('[data-test-id="search-box-input"]').type('SCES{enter}');
    cy
      .get('[data-test-id="checkbox-aggregation-option-conference paper"]')
      .click();

    cy
      .get('[data-test-id="literature-conference-link"]')
      .first()
      .closest('[data-test-id="literature-result-item"]')
      .find('[data-test-id="literature-result-title-link"]')
      .invoke('text')
      .as('literature-title');

    cy
      .get('[data-test-id="literature-conference-link"]')
      .first()
      .click();

    // TODO: create as `waitForRoute` command
    cy.server();
    cy.route('**/literature**').as('contributions');
    cy.wait('@contributions');

    cy.get('[data-test-id="literature-result-title-link"]').then(titles$ => {
      const titles = titles$.toArray().map(title => title.text);
      cy.get('@literature-title').should('be.oneOf', titles);
    });
  });
});
