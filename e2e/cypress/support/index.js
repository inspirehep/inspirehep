import like from 'chai-like';
import './commands';

const ALLOWED_UNCAUGHT_ERROR_MESSAGES = [
  "Cannot read property 'focus' of null", // TODO: explain why
  "ResizeObserver loop limit exceeded",
  "ResizeObserver loop completed with undelivered notifications."
];

Cypress.on('uncaught:exception', error => {
  const shouldThrow = !ALLOWED_UNCAUGHT_ERROR_MESSAGES.some(errorMessage =>
    error.message.includes(errorMessage)
  );

  return shouldThrow;
});

chai.use(like);
