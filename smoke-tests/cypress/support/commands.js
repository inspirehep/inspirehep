Cypress.Commands.add('selectFromDropdown', (dropdownId, option) => {
  const dropdownSelector = `[data-test-id="${dropdownId}"]`;
  const optionSelector = `[data-test-id="${dropdownId}-option-${option}"]`;
  cy.get(dropdownSelector).click();
  cy.get(optionSelector).click();
});

Cypress.Commands.add('text', { prevSubject: true }, subject => {
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
