import { addMatchImageSnapshotCommand } from 'cypress-image-snapshot/command';

addMatchImageSnapshotCommand({
  failureThreshold: 0.05,
  failureThresholdType: 'percent',
  capture: 'fullPage',
  customSnapshotsDir: 'cypress/__snapshots__',
});

Cypress.Commands.add('selectFromDropdown', (dropdownId, option) => {
  const dropdownSelector = `[data-test-id="${dropdownId}"]`;
  const optionSelector = `[data-test-id="${dropdownId}-option-${option}"]`;
  // TODO: instead `first` workaround for sort-by dropdown
  // give id such as `sort-by-{searchNamespace}` to make them unique
  cy
    .get(dropdownSelector)
    .first()
    .click();
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

Cypress.Commands.add('useMobile', () => {
  cy.viewport(
    Cypress.env('mobile_viewport_width'),
    Cypress.env('mobile_viewport_height')
  );
});

Cypress.Commands.add('matchSnapshots', (name, { skipMobile } = {}) => {
  cy.useDesktop();

  // fixes unreliable scrolling when capturing full screen ss
  cy.get('html').invoke('css', 'height', 'initial');
  cy.get('body').invoke('css', 'height', 'initial');

  // fullScreen capturing works by taking ss as it scrolls and stiching them together
  // and sticky elements appears in the final ss, multiple times.
  // therefore we need to disable them
  cy.get('[data-test-id="sticky"]').invoke('css', 'position', 'absolute');

  cy.matchImageSnapshot(`${name}Desktop`);

  if (skipMobile) {
    return;
  }

  // header is not sticky on mobile therefore we need to restore its style
  cy
    .get('.__Header__ [data-test-id="sticky"]')
    .invoke('css', 'position', 'static');
  cy.useMobile();
  cy.matchImageSnapshot(`${name}Mobile`);
});

Cypress.Commands.add('registerRoute', (route = '/api/**', method = 'GET') => {
  cy.server();
  cy.route(method, route).as(route);
});

Cypress.Commands.add('waitForRoute', (route = '/api/**') => {
  return cy.wait(`@${route}`, { timeout: 35000 });
});

Cypress.Commands.add('waitForSearchResults', (route = '/api/**') => {
  cy
    .get('[data-test-id="search-results"]', { timeout: 10000 })
    .should('be.visible');
});

// user: 'johndoe` (regular user) | 'admin' | 'cataloger'
Cypress.Commands.add('login', (user = 'johndoe') => {
  const username = `${user}@inspirehep.net`;
  const password = '123456';
  cy.visit('/user/login/local');

  cy.registerRoute('/api/accounts/login', 'POST');

  cy
    .get('[data-test-id=email]')
    .type(username)
    .get('[data-test-id=password]')
    .type(password)
    .get('[data-test-id=login]')
    .click();

  cy
    .waitForRoute('/api/accounts/login')
    .its('status')
    .should('eq', 200);
});

Cypress.Commands.add('logout', () => {
  cy.visit('/');

  cy.registerRoute('/api/accounts/logout');

  cy.get('[data-test-id=logout]').click();

  cy.waitForRoute('/api/accounts/logout');
});

Cypress.Commands.add('selectLiteratureDocType', docType => {
  cy
    .get('[data-test-id=skip-import-button]')
    .click()
    .get('[data-test-id=document-type-select]')
    .click()
    .get(
      `.ant-select-dropdown [data-test-id=document-type-select-option-${docType}]`
    )
    .click()
    .should('be.hidden'); // wait for dropdown menu to be closed before proceeding further.
});
