import MockAdapter from 'axios-mock-adapter';

import { getStore } from '../../fixtures/store';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.ts' extension. ... Remove this comment to see the full error message
import http from '../../common/http.ts';
import {
  BIBLIOGRAPHY_GENERATOR_REQUEST,
  BIBLIOGRAPHY_GENERATOR_SUCCESS,
  BIBLIOGRAPHY_GENERATOR_ERROR,
} from '../actionTypes';
import { submitBibliographyGenerator } from '../bibliographyGenerator';

const mockHttp = new MockAdapter(http.httpClient);

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('bibliographyGenerator - async action creators', () => {
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'afterEach'.
  afterEach(() => {
    mockHttp.reset();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('creates BIBLIOGRAPHY_GENERATOR_SUCCESS if successful', async (done: any) => {
    const data = { file: 'this is a file' };
    mockHttp
      .onPost('/bibliography-generator?format=bibtex', data)
      .replyOnce(200, { foo: 'bar' });

    const expectedActions = [
      { type: BIBLIOGRAPHY_GENERATOR_REQUEST },
      {
        type: BIBLIOGRAPHY_GENERATOR_SUCCESS,
        payload: { foo: 'bar' },
      },
    ];

    const store = getStore();
    await store.dispatch(submitBibliographyGenerator('bibtex', data));
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(store.getActions()).toEqual(expectedActions);
    done();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('creates BIBLIOGRAPHY_GENERATOR_ERROR if not successful', async (done: any) => {
    mockHttp
      .onPost('/bibliography-generator?format=bibtex')
      .replyOnce(400, { message: 'Error' });

    const expectedActions = [
      { type: BIBLIOGRAPHY_GENERATOR_REQUEST },
      {
        type: BIBLIOGRAPHY_GENERATOR_ERROR,
        payload: {
          error: { message: 'Error', status: 400 },
        },
      },
    ];

    const store = getStore();
    await store.dispatch(submitBibliographyGenerator('bibtex', {}));
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(store.getActions()).toEqual(expectedActions);
    done();
  });
});
