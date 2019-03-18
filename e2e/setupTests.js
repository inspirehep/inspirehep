const { toMatchImageSnapshot } = require('jest-image-snapshot');

jest.setTimeout(120000);

expect.extend({ toMatchImageSnapshot });
