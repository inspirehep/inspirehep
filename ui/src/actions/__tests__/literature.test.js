import MockAdapter from 'axios-mock-adapter';

import { getStore } from '../../fixtures/store';
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

const mockHttp = new MockAdapter(http);

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
    mockHttp.onGet('/literature/123').replyOnce(500, {});

    const expectedActions = [
      { type: LITERATURE_REQUEST, payload: { recordId: 123 } },
      { type: LITERATURE_ERROR, payload: undefined },
    ];

    const store = getStore();
    await store.dispatch(fetchLiterature(123));
    expect(store.getActions()).toEqual(expectedActions);
    done();
  });

  describe('literature references', () => {
    it('happy - creates LITERATURE_REFERENCES_SUCCESS', async done => {
      mockHttp.onGet('/literature/123/references').replyOnce(200, {});

      const expectedActions = [
        { type: LITERATURE_REFERENCES_REQUEST },
        { type: LITERATURE_REFERENCES_SUCCESS, payload: {} },
      ];

      const store = getStore();
      await store.dispatch(fetchLiteratureReferences(123));
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });

    it('unhappy - creates LITERATURE_REFERENCES_ERROR', async done => {
      mockHttp.onGet('/literature/123/references').replyOnce(500, {});

      const expectedActions = [
        { type: LITERATURE_REFERENCES_REQUEST },
        { type: LITERATURE_REFERENCES_ERROR, payload: undefined },
      ];

      const store = getStore();
      await store.dispatch(fetchLiteratureReferences(123));
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
      mockHttp.onGet('/literature/123/authors').replyOnce(500, {});

      const expectedActions = [
        { type: LITERATURE_AUTHORS_REQUEST },
        { type: LITERATURE_AUTHORS_ERROR, payload: undefined },
      ];

      const store = getStore();
      await store.dispatch(fetchLiteratureAuthors(123));
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });
  });
});
