import { addMatchImageSnapshotCommand } from 'cypress-image-snapshot/command';

addMatchImageSnapshotCommand({
  failureThreshold: 0.005,
  failureThresholdType: 'percent',
  capture: 'fullPage',
  customSnapshotsDir: 'cypress/__snapshots__',
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
  // a guard to prevent flaky tests
  cy.get('.__Header__ [data-test-id="sticky"]').should(($el) =>
    expect($el.width()).to.be.above(Cypress.env('mobile_viewport_width'))
  );
  cy.matchImageSnapshot(`${name}Desktop`);

  if (skipMobile) {
    return;
  }

  cy.useMobile();
  // header is not sticky on mobile therefore we need to restore its style
  cy.get('.__Header__ [data-test-id="sticky"]').invoke(
    'css',
    'position',
    'static'
  );
  // a guard to prevent flaky tests
  cy.get('.__Header__ [data-test-id="sticky"]').should(($el) =>
    expect($el.width()).to.be.at.most(Cypress.env('mobile_viewport_width'))
  );
  cy.matchImageSnapshot(`${name}Mobile`);
});
