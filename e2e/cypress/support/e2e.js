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

// The home page fetches the latest posts from the external INSPIRE blog.
// Stub it so e2e runs don't depend on (or hang on) a third-party service.
const STUBBED_BLOG_POSTS = [1, 2, 3].map((id) => ({
  id,
  link: `https://blog.inspirehep.net/post-${id}`,
  title: { rendered: `Blog post ${id}` },
  excerpt: { rendered: `<p>Excerpt ${id}</p>` },
  date: "2024-01-01T00:00:00",
}));

beforeEach(() => {
  cy.intercept("GET", "https://blog.inspirehep.net/wp-json/wp/v2/posts*", {
    statusCode: 200,
    body: STUBBED_BLOG_POSTS,
  });
});
