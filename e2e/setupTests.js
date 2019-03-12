const { toMatchImageSnapshot } = require('jest-image-snapshot');

jest.setTimeout(60000);

expect.extend({ toMatchImageSnapshot });
