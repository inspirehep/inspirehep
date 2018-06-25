const { toMatchImageSnapshot } = require('jest-image-snapshot');

jest.setTimeout(30000);
expect.extend({ toMatchImageSnapshot });
