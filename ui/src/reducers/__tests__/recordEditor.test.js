import { Map, fromJS } from 'immutable';

import reducer, { initialState } from '../recordEditor';
import {
  EDITOR_AUTHOR_ERROR,
  EDITOR_AUTHOR_REQUEST,
  EDITOR_AUTHOR_SUCCESS,
  EDITOR_AUTHOR_REVISIONS_ERROR,
  EDITOR_AUTHOR_REVISIONS_REQUEST,
  EDITOR_AUTHOR_REVISIONS_SUCCESS,
  EDITOR_AUTHOR_SAVE_REQUEST,
  EDITOR_AUTHOR_SAVE_SUCCESS,
  EDITOR_AUTHOR_SAVE_ERROR,
} from '../../actions/actionTypes';

describe('recordEditor reducer', () => {
  it('default', () => {
    const state = reducer(undefined, {});
    expect(state).toEqual(initialState);
  });

  it('EDITOR_AUTHOR_REQUEST', () => {
    const state = reducer(Map(), { type: EDITOR_AUTHOR_REQUEST });
    const expected = Map({ author: {} });
    expect(state).toEqual(expected);
  });

  it('EDITOR_AUTHOR_SUCCESS', () => {
    const eTag = 'test';
    const payload = {
      data: {
        metadata: {
          name: {
            preferred_name: 'Jessica Jones',
          },
        },
      },
      eTag,
    };
    const currentState = fromJS({ author: {} });
    const state = reducer(currentState, {
      type: EDITOR_AUTHOR_SUCCESS,
      payload,
    });
    const expected = fromJS({
      author: payload.data,
      currentRecordETag: eTag,
    });
    expect(state).toEqual(expected);
  });

  it('EDITOR_AUTHOR_ERROR', () => {
    const currentState = fromJS({
      author: { metadata: { control_number: 123 } },
    });
    const state = reducer(currentState, { type: EDITOR_AUTHOR_ERROR });
    const expected = fromJS({
      author: initialState.get('author'),
    });
    expect(state).toEqual(expected);
  });

  it('EDITOR_AUTHOR_REVISIONS_REQUEST', () => {
    const state = reducer(initialState, {
      type: EDITOR_AUTHOR_REVISIONS_REQUEST,
    });
    expect(state).toEqual(initialState);
  });

  it('EDITOR_AUTHOR_REVISIONS_SUCCESS', () => {
    const payload = {
      data: [{ rev_id: 1 }, { rev_id: 2 }],
    };
    const currentState = fromJS({ author_revisions: [] });
    const state = reducer(currentState, {
      type: EDITOR_AUTHOR_REVISIONS_SUCCESS,
      payload,
    });
    const expected = fromJS({
      author_revisions: payload.data,
    });
    expect(state).toEqual(expected);
  });

  it('EDITOR_AUTHOR_REVISIONS_ERROR', () => {
    const currentState = fromJS({
      author_revisions: [{ rev_id: 1 }],
    });
    const state = reducer(currentState, {
      type: EDITOR_AUTHOR_REVISIONS_ERROR,
    });
    const expected = fromJS({
      author_revisions: initialState.get('author_revisions'),
    });
    expect(state).toEqual(expected);
  });

  it('EDITOR_AUTHOR_SAVE_REQUEST', () => {
    const state = reducer(Map(), { type: EDITOR_AUTHOR_SAVE_REQUEST });
    const expected = Map({ saveError: null });
    expect(state).toEqual(expected);
  });

  it('EDITOR_AUTHOR_SAVE_SUCCESS', () => {
    const state = reducer(initialState, {
      type: EDITOR_AUTHOR_SAVE_SUCCESS,
    });
    expect(state).toEqual(initialState);
  });

  it('EDITOR_AUTHOR_SAVE_ERROR', () => {
    const errorMessage = ' not working';
    const currentState = fromJS({ saveError: null });
    const state = reducer(currentState, {
      type: EDITOR_AUTHOR_SAVE_ERROR,
      payload: { error: errorMessage },
    });
    const expected = fromJS({
      saveError: errorMessage,
    });
    expect(state).toEqual(expected);
  });
});
