import { fromJS } from 'immutable';

import reducer, { initialState } from '../backoffice';
import {
  BACKOFFICE_LOGIN_ERROR,
  BACKOFFICE_LOGIN_SUCCESS,
  BACKOFFICE_LOGOUT_SUCCESS,
  BACKOFFICE_LOGIN_CHECK,
  BACKOFFICE_LOGIN_REQUEST,
  BACKOFFICE_SEARCH_REQUEST,
  BACKOFFICE_SEARCH_ERROR,
  BACKOFFICE_SEARCH_SUCCESS,
  BACKOFFICE_SEARCH_QUERY_RESET,
  BACKOFFICE_AUTHOR_REQUEST,
  BACKOFFICE_AUTHOR_ERROR,
  BACKOFFICE_AUTHOR_SUCCESS,
  BACKOFFICE_LITERATURE_REQUEST,
  BACKOFFICE_LITERATURE_ERROR,
  BACKOFFICE_LITERATURE_SUCCESS,
  BACKOFFICE_UPDATE_LITERATURE_REQUEST,
  BACKOFFICE_UPDATE_LITERATURE_SUCCESS,
  BACKOFFICE_UPDATE_LITERATURE_ERROR,
  BACKOFFICE_RESOLVE_ACTION_REQUEST,
  BACKOFFICE_RESOLVE_ACTION_SUCCESS,
  BACKOFFICE_RESOLVE_ACTION_ERROR,
  BACKOFFICE_BATCH_RESOLVE_ACTION_REQUEST,
  BACKOFFICE_BATCH_SUBMITTED_IDS_CLEAR,
  BACKOFFICE_RESTART_ACTION_REQUEST,
  BACKOFFICE_RESTART_ACTION_SUCCESS,
  BACKOFFICE_RESTART_ACTION_ERROR,
  BACKOFFICE_DELETE_REQUEST,
  BACKOFFICE_DELETE_SUCCESS,
  BACKOFFICE_DELETE_ERROR,
  BACKOFFICE_AUTHORS_DASHBOARD_REQUEST,
  BACKOFFICE_AUTHORS_DASHBOARD_SUCCESS,
  BACKOFFICE_AUTHORS_DASHBOARD_ERROR,
  BACKOFFICE_LITERATURE_DASHBOARD_REQUEST,
  BACKOFFICE_LITERATURE_DASHBOARD_SUCCESS,
  BACKOFFICE_LITERATURE_DASHBOARD_ERROR,
} from '../../actions/actionTypes';

describe('backoffice reducer', () => {
  it('default', () => {
    const state = reducer(undefined, {});
    expect(state).toEqual(initialState);
  });

  describe('login', () => {
    const dirtyState = initialState
      .set('loggedIn', true)
      .set('totalResults', 5)
      .set('searchResults', fromJS([{ id: 1 }]));

    [
      BACKOFFICE_LOGIN_CHECK,
      BACKOFFICE_LOGIN_REQUEST,
      BACKOFFICE_LOGIN_ERROR,
      BACKOFFICE_LOGOUT_SUCCESS,
    ].forEach((type) => {
      it(`${type} resets to initial state`, () => {
        expect(reducer(dirtyState, { type })).toEqual(initialState);
      });
    });

    it('BACKOFFICE_LOGIN_SUCCESS', () => {
      const state = reducer(initialState, { type: BACKOFFICE_LOGIN_SUCCESS });
      expect(state.get('loggedIn')).toBe(true);
    });
  });

  describe('search', () => {
    it('BACKOFFICE_SEARCH_REQUEST', () => {
      const state = reducer(initialState, { type: BACKOFFICE_SEARCH_REQUEST });
      expect(state.get('loading')).toBe(true);
    });

    it('BACKOFFICE_SEARCH_SUCCESS', () => {
      const data = {
        results: [{ id: 1 }, { id: 2 }],
        count: 2,
        facets: { status: { buckets: [] } },
      };
      const currentState = initialState.set('loading', true);
      const state = reducer(currentState, {
        type: BACKOFFICE_SEARCH_SUCCESS,
        payload: { data },
      });
      expect(state.get('loading')).toBe(false);
      expect(state.get('searchResults')).toEqual(fromJS(data.results));
      expect(state.get('totalResults')).toBe(2);
      expect(state.get('facets')).toEqual(fromJS(data.facets));
    });

    it('BACKOFFICE_SEARCH_ERROR clears results', () => {
      const currentState = initialState
        .set('loading', true)
        .set('searchResults', fromJS([{ id: 1 }]))
        .set('totalResults', 1)
        .set('facets', fromJS({ a: 1 }));
      const state = reducer(currentState, { type: BACKOFFICE_SEARCH_ERROR });
      expect(state.get('loading')).toBe(false);
      expect(state.get('searchResults')).toEqual(
        initialState.get('searchResults')
      );
      expect(state.get('totalResults')).toBe(0);
      expect(state.get('facets')).toEqual(initialState.get('facets'));
    });

    it('BACKOFFICE_SEARCH_QUERY_RESET', () => {
      const currentState = initialState.set(
        'query',
        fromJS({ page: 4, size: 50, ordering: 'x', status: 'approval' })
      );
      const state = reducer(currentState, {
        type: BACKOFFICE_SEARCH_QUERY_RESET,
      });
      expect(state.get('query')).toEqual(fromJS({ page: 1, size: 10 }));
    });
  });

  describe('author', () => {
    it('BACKOFFICE_AUTHOR_REQUEST', () => {
      const state = reducer(initialState, { type: BACKOFFICE_AUTHOR_REQUEST });
      expect(state.get('loading')).toBe(true);
    });

    it('BACKOFFICE_AUTHOR_SUCCESS', () => {
      const data = { id: 'abc', data: { name: 'Jones' } };
      const state = reducer(initialState.set('loading', true), {
        type: BACKOFFICE_AUTHOR_SUCCESS,
        payload: { data },
      });
      expect(state.get('loading')).toBe(false);
      expect(state.get('author')).toEqual(fromJS(data));
    });

    it('BACKOFFICE_AUTHOR_ERROR', () => {
      const currentState = initialState
        .set('loading', true)
        .set('author', fromJS({ id: 'abc' }));
      const state = reducer(currentState, { type: BACKOFFICE_AUTHOR_ERROR });
      expect(state.get('loading')).toBe(false);
      expect(state.get('author')).toEqual(initialState.get('author'));
    });
  });

  describe('literature', () => {
    it('BACKOFFICE_LITERATURE_REQUEST', () => {
      const state = reducer(initialState, {
        type: BACKOFFICE_LITERATURE_REQUEST,
      });
      expect(state.get('loading')).toBe(true);
    });

    it('BACKOFFICE_LITERATURE_SUCCESS', () => {
      const data = { id: 'lit', data: { titles: [{ title: 'T' }] } };
      const state = reducer(initialState.set('loading', true), {
        type: BACKOFFICE_LITERATURE_SUCCESS,
        payload: { data },
      });
      expect(state.get('loading')).toBe(false);
      expect(state.get('literature')).toEqual(fromJS(data));
    });

    it('BACKOFFICE_LITERATURE_ERROR', () => {
      const currentState = initialState
        .set('loading', true)
        .set('literature', fromJS({ id: 'lit' }));
      const state = reducer(currentState, {
        type: BACKOFFICE_LITERATURE_ERROR,
      });
      expect(state.get('loading')).toBe(false);
      expect(state.get('literature')).toEqual(initialState.get('literature'));
    });
  });

  describe('actionInProgress', () => {
    [
      [
        BACKOFFICE_UPDATE_LITERATURE_REQUEST,
        BACKOFFICE_UPDATE_LITERATURE_SUCCESS,
        BACKOFFICE_UPDATE_LITERATURE_ERROR,
      ],
      [
        BACKOFFICE_RESOLVE_ACTION_REQUEST,
        BACKOFFICE_RESOLVE_ACTION_SUCCESS,
        BACKOFFICE_RESOLVE_ACTION_ERROR,
      ],
    ].forEach(([request, success, error]) => {
      it(`${request} sets actionInProgress`, () => {
        const payload = { id: '1', action: 'accept' };
        const state = reducer(initialState, { type: request, payload });
        expect(state.get('actionInProgress')).toEqual(fromJS(payload));
      });

      it(`${success} clears actionInProgress`, () => {
        const currentState = initialState.set(
          'actionInProgress',
          fromJS({ id: '1' })
        );
        const state = reducer(currentState, { type: success });
        expect(state.get('actionInProgress')).toBeNull();
      });

      it(`${error} clears actionInProgress`, () => {
        const currentState = initialState.set(
          'actionInProgress',
          fromJS({ id: '1' })
        );
        const state = reducer(currentState, { type: error });
        expect(state.get('actionInProgress')).toBeNull();
      });
    });
  });

  describe('batch resolve', () => {
    it('BACKOFFICE_BATCH_RESOLVE_ACTION_REQUEST stores ids', () => {
      const state = reducer(initialState, {
        type: BACKOFFICE_BATCH_RESOLVE_ACTION_REQUEST,
        payload: { ids: ['a', 'b'] },
      });
      expect(state.get('batchSubmittedIds')).toEqual(fromJS(['a', 'b']));
    });

    it('BACKOFFICE_BATCH_RESOLVE_ACTION_REQUEST defaults to empty without ids', () => {
      const state = reducer(initialState, {
        type: BACKOFFICE_BATCH_RESOLVE_ACTION_REQUEST,
        payload: {},
      });
      expect(state.get('batchSubmittedIds')).toEqual(fromJS([]));
    });

    it('BACKOFFICE_BATCH_SUBMITTED_IDS_CLEAR', () => {
      const currentState = initialState.set(
        'batchSubmittedIds',
        fromJS(['a', 'b'])
      );
      const state = reducer(currentState, {
        type: BACKOFFICE_BATCH_SUBMITTED_IDS_CLEAR,
      });
      expect(state.get('batchSubmittedIds')).toEqual(
        initialState.get('batchSubmittedIds')
      );
    });
  });

  describe('restart action', () => {
    it('BACKOFFICE_RESTART_ACTION_REQUEST', () => {
      const payload = { id: '1' };
      const state = reducer(initialState, {
        type: BACKOFFICE_RESTART_ACTION_REQUEST,
        payload,
      });
      expect(state.get('restartActionInProgress')).toEqual(fromJS(payload));
    });

    [
      BACKOFFICE_RESTART_ACTION_SUCCESS,
      BACKOFFICE_RESTART_ACTION_ERROR,
    ].forEach((type) => {
      it(`${type} clears restartActionInProgress`, () => {
        const currentState = initialState.set(
          'restartActionInProgress',
          fromJS({ id: '1' })
        );
        const state = reducer(currentState, { type });
        expect(state.get('restartActionInProgress')).toBeNull();
      });
    });
  });

  describe('delete', () => {
    it('BACKOFFICE_DELETE_REQUEST', () => {
      const state = reducer(initialState, { type: BACKOFFICE_DELETE_REQUEST });
      expect(state.get('loading')).toBe(true);
    });

    it('BACKOFFICE_DELETE_SUCCESS clears author', () => {
      const currentState = initialState
        .set('loading', true)
        .set('author', fromJS({ id: 'abc' }));
      const state = reducer(currentState, { type: BACKOFFICE_DELETE_SUCCESS });
      expect(state.get('loading')).toBe(false);
      expect(state.get('author')).toEqual(initialState.get('author'));
    });

    it('BACKOFFICE_DELETE_ERROR keeps author', () => {
      const currentState = initialState
        .set('loading', true)
        .set('author', fromJS({ id: 'abc' }));
      const state = reducer(currentState, { type: BACKOFFICE_DELETE_ERROR });
      expect(state.get('loading')).toBe(false);
      expect(state.get('author')).toEqual(fromJS({ id: 'abc' }));
    });
  });

  describe('dashboard', () => {
    const pending = (state, key) => state.getIn(['dashboard', 'pending', key]);

    it('BACKOFFICE_AUTHORS_DASHBOARD_REQUEST', () => {
      const state = reducer(initialState, {
        type: BACKOFFICE_AUTHORS_DASHBOARD_REQUEST,
      });
      expect(pending(state, 'authors')).toBe(true);
      expect(pending(state, 'literature')).toBe(false);
      expect(state.getIn(['dashboard', 'loading'])).toBe(true);
    });

    it('BACKOFFICE_AUTHORS_DASHBOARD_SUCCESS', () => {
      const payload = { status: { buckets: [] } };
      const currentState = reducer(initialState, {
        type: BACKOFFICE_AUTHORS_DASHBOARD_REQUEST,
      });
      const state = reducer(currentState, {
        type: BACKOFFICE_AUTHORS_DASHBOARD_SUCCESS,
        payload,
      });
      expect(state.getIn(['dashboard', 'facets', 'authors'])).toEqual(
        fromJS(payload)
      );
      expect(pending(state, 'authors')).toBe(false);
      expect(state.getIn(['dashboard', 'loading'])).toBe(false);
    });

    it('BACKOFFICE_AUTHORS_DASHBOARD_ERROR resets facets', () => {
      const currentState = reducer(
        initialState.setIn(
          ['dashboard', 'facets', 'authors'],
          fromJS({ a: 1 })
        ),
        { type: BACKOFFICE_AUTHORS_DASHBOARD_REQUEST }
      );
      const state = reducer(currentState, {
        type: BACKOFFICE_AUTHORS_DASHBOARD_ERROR,
      });
      expect(state.getIn(['dashboard', 'facets', 'authors'])).toEqual(
        fromJS({})
      );
      expect(state.getIn(['dashboard', 'loading'])).toBe(false);
    });

    it('BACKOFFICE_LITERATURE_DASHBOARD_REQUEST', () => {
      const state = reducer(initialState, {
        type: BACKOFFICE_LITERATURE_DASHBOARD_REQUEST,
      });
      expect(pending(state, 'literature')).toBe(true);
      expect(pending(state, 'authors')).toBe(false);
      expect(state.getIn(['dashboard', 'loading'])).toBe(true);
    });

    it('BACKOFFICE_LITERATURE_DASHBOARD_SUCCESS', () => {
      const payload = { status: { buckets: [] } };
      const currentState = reducer(initialState, {
        type: BACKOFFICE_LITERATURE_DASHBOARD_REQUEST,
      });
      const state = reducer(currentState, {
        type: BACKOFFICE_LITERATURE_DASHBOARD_SUCCESS,
        payload,
      });
      expect(state.getIn(['dashboard', 'facets', 'literature'])).toEqual(
        fromJS(payload)
      );
      expect(pending(state, 'literature')).toBe(false);
      expect(state.getIn(['dashboard', 'loading'])).toBe(false);
    });

    it('BACKOFFICE_LITERATURE_DASHBOARD_ERROR resets facets', () => {
      const currentState = reducer(
        initialState.setIn(
          ['dashboard', 'facets', 'literature'],
          fromJS({ a: 1 })
        ),
        { type: BACKOFFICE_LITERATURE_DASHBOARD_REQUEST }
      );
      const state = reducer(currentState, {
        type: BACKOFFICE_LITERATURE_DASHBOARD_ERROR,
      });
      expect(state.getIn(['dashboard', 'facets', 'literature'])).toEqual(
        fromJS({})
      );
      expect(state.getIn(['dashboard', 'loading'])).toBe(false);
    });

    it('dashboard stays loading until both requests settle', () => {
      let state = reducer(initialState, {
        type: BACKOFFICE_AUTHORS_DASHBOARD_REQUEST,
      });
      state = reducer(state, { type: BACKOFFICE_LITERATURE_DASHBOARD_REQUEST });
      state = reducer(state, {
        type: BACKOFFICE_AUTHORS_DASHBOARD_SUCCESS,
        payload: {},
      });
      expect(state.getIn(['dashboard', 'loading'])).toBe(true);
      state = reducer(state, {
        type: BACKOFFICE_LITERATURE_DASHBOARD_ERROR,
      });
      expect(state.getIn(['dashboard', 'loading'])).toBe(false);
    });
  });
});
