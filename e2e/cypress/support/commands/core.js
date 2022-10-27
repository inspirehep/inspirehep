Cypress.Commands.add('text', { prevSubject: true }, (subject) => {
  return subject.text();
});

Cypress.Commands.overwrite('visit', (originalVisit, relativeUrl, options) => {
  const baseUrl = Cypress.env('inspirehep_url');
  const absoluteUrl = `${baseUrl}${relativeUrl}`;
  return originalVisit(absoluteUrl, options);
});

Cypress.Commands.add('useDesktop', () => {
  cy.viewport(
    Cypress.env('desktop_viewport_width'),
    Cypress.env('desktop_viewport_height')
  );
});

Cypress.Commands.add('useMobile', () => {
  cy.viewport(
    Cypress.env('mobile_viewport_width'),
    Cypress.env('mobile_viewport_height')
  );
});

Cypress.Commands.add('selectFromDropdown', (dropdownId, option) => {
  const dropdownSelector = `[data-test-id="${dropdownId}"]`;
  const optionSelector = `[data-test-id="${dropdownId}-option-${option}"]`;
  // TODO: instead `first` workaround for sort-by dropdown
  // give id such as `sort-by-{searchNamespace}` to make them unique
  cy.get(dropdownSelector).first().click();
  cy.get(optionSelector).click();
});

Cypress.Commands.add('selectFromSelectBox', (selectBoxId, options) => {
  const selectBoxSelector = `[data-test-id="${selectBoxId}"]`;
  const selectBoxInputSelector = `${selectBoxSelector} input`;
  cy.get(selectBoxSelector).then(($selectBox) => {
    const hasSearch = $selectBox.hasClass('ant-select-show-search');
    const isMultiSelect = Array.isArray(options);
    cy.wrap($selectBox).click();
    cy.get('.ant-select-dropdown').invoke('css', 'display', 'initial').should('be.visible');
    const optionsArray = isMultiSelect ? options : [options];
    for (const option of optionsArray) {
      if (hasSearch) {
        cy.get(selectBoxInputSelector).focus().type(`${option}`, { force: true });
      }
      const optionSelector = `[data-test-id="${selectBoxId}-option-${option}"]`;
      cy.get(optionSelector).click();
    }

    if (isMultiSelect) {
      cy.wrap($selectBox).click({ force: true });
    }

    cy.get('.ant-select-dropdown').invoke('css', 'display', 'none').should('not.be.visible');
  });
});

Cypress.Commands.add('registerRoute', (optionsOrRoute = '/api/**') => {
  let route;
  if (optionsOrRoute instanceof RegExp || typeof optionsOrRoute === 'string') {
    route = optionsOrRoute;
  } else {
    route = optionsOrRoute.url;
  }

  cy.server();
  cy.route(optionsOrRoute).as(route);
});

Cypress.Commands.add('waitForRoute', (route = '/api/**') => {
  return cy.wait(`@${route}`, { timeout: 40000 });
});

Cypress.Commands.add('requestRecord', ({ collection, recordId }) => {
  cy.request(`/api/${collection}/${recordId}`).its('body');
});
Cypress.Commands.add('requestWorkflow', ({ workflowId }) => {
  cy.request(`/api/holdingpen/${workflowId}`).its('body');
});
Cypress.Commands.add('requestEditor', ({ collection, recordId }) => {
  cy.request(`/editor/record/${collection}/${recordId}`).its('body');
});

Cypress.Commands.add('waitForSearchResults', () => {
  cy.get('[data-test-id="search-results"]', { timeout: 10000 }).should(
    'be.visible'
  );
});

Cypress.Commands.add('waitForLoading', () => {
  cy.get('[data-test-id="loading"]', { timeout: 10000 }).should('not.exist');
});
