import MockAdapter from 'axios-mock-adapter';
import { fromJS } from 'immutable';

import { getStore, getStoreWithState } from '../../fixtures/store';
import http from '../../common/http';
import {
  LITERATURE_ERROR,
  LITERATURE_REQUEST,
  LITERATURE_SUCCESS,
  LITERATURE_AUTHORS_ERROR,
  LITERATURE_AUTHORS_REQUEST,
  LITERATURE_AUTHORS_SUCCESS,
  LITERATURE_REFERENCES_ERROR,
  LITERATURE_REFERENCES_REQUEST,
  LITERATURE_REFERENCES_SUCCESS,
} from '../actionTypes';
import {
  fetchLiterature,
  fetchLiteratureAuthors,
  fetchLiteratureReferences,
} from '../literature';

const mockHttp = new MockAdapter(http.httpClient);

describe('literature - async action creators', () => {
  afterEach(() => {
    mockHttp.reset();
  });

  it('happy - creates LITERATURE_SUCCESS', async done => {
    mockHttp.onGet('/literature/123').replyOnce(200, {});

    const expectedActions = [
      { type: LITERATURE_REQUEST, payload: { recordId: 123 } },
      { type: LITERATURE_SUCCESS, payload: {} },
    ];

    const store = getStore();
    await store.dispatch(fetchLiterature(123));
    expect(store.getActions()).toEqual(expectedActions);
    done();
  });

  it('unhappy - creates LITERATURE_ERROR', async done => {
    mockHttp.onGet('/literature/123').replyOnce(500);

    const expectedActions = [
      { type: LITERATURE_REQUEST, payload: { recordId: 123 } },
      {
        type: LITERATURE_ERROR,
        payload: { error: { status: 500 } },
        meta: { redirectableError: true },
      },
    ];

    const store = getStore();
    await store.dispatch(fetchLiterature(123));
    expect(store.getActions()).toEqual(expectedActions);
    done();
  });

  describe('literature references', () => {
    it('happy - creates LITERATURE_REFERENCES_SUCCESS', async done => {
      mockHttp
        .onGet('/literature/123/references?page=1&size=10')
        .replyOnce(200, {});

      const expectedActions = [
        { type: LITERATURE_REFERENCES_REQUEST, payload: { page: 1, size: 10 } },
        { type: LITERATURE_REFERENCES_SUCCESS, payload: {} },
      ];

      const store = getStore();
      await store.dispatch(
        fetchLiteratureReferences(123, { page: 1, size: 10 })
      );
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });

    it('fetches references with merging the given query into the existing one ', async done => {
      mockHttp
        .onGet(
          '/literature/123/references?size=10&page=10&q=dude&sort=mostrecent'
        )
        .replyOnce(200, {});

      const expectedActions = [
        {
          type: LITERATURE_REFERENCES_REQUEST,
          payload: { size: 10, page: 10, q: 'dude', sort: 'mostrecent' },
        },
        { type: LITERATURE_REFERENCES_SUCCESS, payload: {} },
      ];

      const store = getStoreWithState({
        literature: fromJS({
          queryReferences: { size: 10, page: 2, q: 'dude', sort: 'mostrecent' },
        }),
      });
      await store.dispatch(fetchLiteratureReferences(123, { page: 10 }));
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });

    it('unhappy - creates LITERATURE_REFERENCES_ERROR', async done => {
      mockHttp
        .onGet('/literature/123/references?page=1&size=10')
        .replyOnce(404, { message: 'Not found' });

      const expectedActions = [
        { type: LITERATURE_REFERENCES_REQUEST, payload: { page: 1, size: 10 } },
        {
          type: LITERATURE_REFERENCES_ERROR,
          payload: { error: { status: 404, message: 'Not found' } },
        },
      ];

      const store = getStore();
      await store.dispatch(
        fetchLiteratureReferences(123, { page: 1, size: 10 })
      );
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });
  });

  describe('literature authors', () => {
    it('happy - creates LITERATURE_AUTHORS_SUCCESS', async done => {
      mockHttp.onGet('/literature/123/authors').replyOnce(200, {});

      const expectedActions = [
        { type: LITERATURE_AUTHORS_REQUEST },
        { type: LITERATURE_AUTHORS_SUCCESS, payload: {} },
      ];

      const store = getStore();
      await store.dispatch(fetchLiteratureAuthors(123));
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });

    it('unhappy - creates LITERATURE_AUTHORS_ERROR', async done => {
      mockHttp.onGet('/literature/123/authors').replyOnce(500);

      const expectedActions = [
        { type: LITERATURE_AUTHORS_REQUEST },
        {
          type: LITERATURE_AUTHORS_ERROR,
          payload: {
            error: { status: 500 },
          },
        },
      ];

      const store = getStore();
      await store.dispatch(fetchLiteratureAuthors(123));
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });
  });
});
