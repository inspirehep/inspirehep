import MockAdapter from 'axios-mock-adapter';
import { fromJS } from 'immutable';

import { getStore, getStoreWithState } from '../../fixtures/store';
import http from '../../common/http';
import {
  AUTHOR_ERROR,
  AUTHOR_REQUEST,
  AUTHOR_SUCCESS,
  AUTHOR_PUBLICATIONS_REQUEST,
  AUTHOR_PUBLICATIONS_SUCCESS,
  AUTHOR_PUBLICATIONS_ERROR,
  AUTHOR_PUBLICATIONS_FACETS_REQUEST,
  AUTHOR_PUBLICATIONS_FACETS_SUCCESS,
  AUTHOR_PUBLICATIONS_FACETS_ERROR,
} from '../actionTypes';
import {
  fetchAuthor,
  fetchAuthorPublications,
  fetchAuthorPublicationsFacets,
} from '../authors';

const mockHttp = new MockAdapter(http);

describe('AUTHOR - async action creators', () => {
  describe('fetch author', () => {
    afterEach(() => {
      mockHttp.reset();
    });

    it('creates AUTHOR_SUCCESS', async done => {
      mockHttp.onGet('/authors/123').replyOnce(200, { foo: 'bar' });

      const expectedActions = [
        { type: AUTHOR_REQUEST, payload: { recordId: 123 } },
        { type: AUTHOR_SUCCESS, payload: { foo: 'bar' } },
      ];

      const store = getStore();
      await store.dispatch(fetchAuthor(123));
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });

    it('creates AUTHOR_ERROR', async done => {
      mockHttp.onGet('/authors/123').replyOnce(500, { message: 'Error' });

      const expectedActions = [
        { type: AUTHOR_REQUEST, payload: { recordId: 123 } },
        {
          type: AUTHOR_ERROR,
          payload: { message: 'Error' },
          meta: { redirectableError: true },
        },
      ];

      const store = getStore();
      await store.dispatch(fetchAuthor(123));
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });
  });

  describe('fetches author publications for current author in the state by merging new partial query into existing publications query in state', () => {
    afterEach(() => {
      mockHttp.reset();
    });

    it('and creates AUTHOR_PUBLICATIONS_SUCCESS if successful', async done => {
      mockHttp
        .onGet('/literature?size=5&page=3&author=Harun&q=test')
        .replyOnce(200, { foo: 'bar' });

      const expectedActions = [
        {
          type: AUTHOR_PUBLICATIONS_REQUEST,
          payload: { size: 5, page: 3, q: 'test', author: ['Harun'] },
        },
        { type: AUTHOR_PUBLICATIONS_SUCCESS, payload: { foo: 'bar' } },
      ];

      const store = getStoreWithState({
        authors: fromJS({
          data: {
            metadata: {
              facet_author_name: 'Harun',
            },
          },
          publications: {
            query: { size: 5, page: 2, author: ['Harun'] },
          },
        }),
      });
      await store.dispatch(fetchAuthorPublications({ page: 3, q: 'test' }));
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });

    it('but uses size=100 when user is cataloger and creates AUTHOR_PUBLICATIONS_SUCCESS if successful', async done => {
      mockHttp
        .onGet('/literature?author=Harun&size=100&page=1')
        .replyOnce(200, { foo: 'bar' });

      const expectedActions = [
        {
          type: AUTHOR_PUBLICATIONS_REQUEST,
          payload: { size: 100, page: 1, author: ['Harun'] },
        },
        { type: AUTHOR_PUBLICATIONS_SUCCESS, payload: { foo: 'bar' } },
      ];

      const store = getStoreWithState({
        authors: fromJS({
          data: {
            metadata: {
              facet_author_name: 'Harun',
            },
          },
          publications: {
            query: { author: ['Harun'] },
          },
        }),
        user: fromJS({
          loggedIn: true,
          data: {
            roles: ['cataloger'],
          },
        }),
      });
      await store.dispatch(fetchAuthorPublications({ page: 1 }));
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });

    it('and creates AUTHOR_PUBLICATIONS_ERROR if NOT successful', async done => {
      mockHttp
        .onGet('/literature?size=5&page=3&author=Harun&q=test')
        .replyOnce(500, { message: 'Error' });

      const expectedActions = [
        {
          type: AUTHOR_PUBLICATIONS_REQUEST,
          payload: { size: 5, page: 3, q: 'test', author: ['Harun'] },
        },
        {
          type: AUTHOR_PUBLICATIONS_ERROR,
          payload: { message: 'Error', status: 500 },
        },
      ];

      const store = getStoreWithState({
        authors: fromJS({
          data: {
            metadata: {
              facet_author_name: 'Harun',
            },
          },
          publications: {
            query: { size: 5, page: 2, author: ['Harun'] },
          },
        }),
      });
      await store.dispatch(fetchAuthorPublications({ page: 3, q: 'test' }));
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });
  });

  describe('fetches facets of author publications for current author in the state by merging new partial query into existing publications query in state', () => {
    afterEach(() => {
      mockHttp.reset();
    });

    it('and creates AUTHOR_PUBLICATIONS_FACETS_SUCCESS if successful', async done => {
      mockHttp
        .onGet(
          '/literature/facets?facet_name=hep-author-publication&author_recid=Harun&size=5&page=3&author=Harun&q=test'
        )
        .replyOnce(200, { foo: 'bar' });

      const expectedActions = [
        {
          type: AUTHOR_PUBLICATIONS_FACETS_REQUEST,
          payload: { size: 5, page: 3, q: 'test', author: ['Harun'] },
        },
        { type: AUTHOR_PUBLICATIONS_FACETS_SUCCESS, payload: { foo: 'bar' } },
      ];

      const store = getStoreWithState({
        authors: fromJS({
          data: {
            metadata: {
              facet_author_name: 'Harun',
            },
          },
          publications: {
            query: { size: 5, page: 2, author: ['Harun'] },
          },
        }),
      });
      await store.dispatch(
        fetchAuthorPublicationsFacets({ page: 3, q: 'test' })
      );
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });

    it('and creates AUTHOR_PUBLICATIONS_FACETS_ERROR if NOT successful', async done => {
      mockHttp
        .onGet(
          '/literature/facets?facet_name=hep-author-publication&author_recid=Harun&size=5&page=3&author=Harun&q=test'
        )
        .replyOnce(500, { message: 'Error' });

      const expectedActions = [
        {
          type: AUTHOR_PUBLICATIONS_FACETS_REQUEST,
          payload: { size: 5, page: 3, q: 'test', author: ['Harun'] },
        },
        {
          type: AUTHOR_PUBLICATIONS_FACETS_ERROR,
          payload: { message: 'Error', status: 500 },
        },
      ];

      const store = getStoreWithState({
        authors: fromJS({
          data: {
            metadata: {
              facet_author_name: 'Harun',
            },
          },
          publications: {
            query: { size: 5, page: 2, author: ['Harun'] },
          },
        }),
      });
      await store.dispatch(
        fetchAuthorPublicationsFacets({ page: 3, q: 'test' })
      );
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });
  });
});
