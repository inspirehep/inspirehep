import MockAdapter from 'axios-mock-adapter';

import { getStore } from '../../fixtures/store';
import http from '../../common/http';
import {
  BIBLIOGRAPHY_GENERATOR_REQUEST,
  BIBLIOGRAPHY_GENERATOR_SUCCESS,
  BIBLIOGRAPHY_GENERATOR_ERROR,
} from '../actionTypes';
import { submitBibliographyGenerator } from '../bibliographyGenerator';

const mockHttp = new MockAdapter(http.httpClient);

describe('bibliographyGenerator - async action creators', () => {
  afterEach(() => {
    mockHttp.reset();
  });

  it('creates BIBLIOGRAPHY_GENERATOR_SUCCESS if successful', async done => {
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
    expect(store.getActions()).toEqual(expectedActions);
    done();
  });

  it('creates BIBLIOGRAPHY_GENERATOR_ERROR if not successful', async done => {
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
    expect(store.getActions()).toEqual(expectedActions);
    done();
  });
});
