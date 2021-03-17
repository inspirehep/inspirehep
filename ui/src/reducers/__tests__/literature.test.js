import { Map, fromJS, Set } from 'immutable';
import reducer, { initialState } from '../literature';
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
  LITERATURE_SELECTION_SET,
  LITERATURE_SET_ASSIGN_DRAWER_VISIBILITY,
  LITERATURE_SELECTION_CLEAR,
  CLEAR_STATE,
} from '../../actions/actionTypes';

describe('literature reducer', () => {
  it('default', () => {
    const state = reducer(undefined, {});
    expect(state).toEqual(initialState);
  });

  it('CLEAR_STATE', () => {
    const currentState = fromJS({
      data: {
        control_number: 123456,
      },
    });
    const state = reducer(currentState, { type: CLEAR_STATE });
    expect(state).toEqual(initialState);
  });

  it('LITERATURE_REQUEST', () => {
    const state = reducer(Map(), { type: LITERATURE_REQUEST });
    const expected = Map({ loading: true });
    expect(state).toEqual(expected);
  });

  it('LITERATURE_SUCCESS', () => {
    const payload = {
      metadata: {
        titles: [
          {
            title: 'Jessica Jones',
          },
        ],
      },
    };
    const state = reducer(Map(), { type: LITERATURE_SUCCESS, payload });
    const expected = fromJS({
      loading: false,
      data: payload,
      error: null,
    });
    expect(state).toEqual(expected);
  });

  it('LITERATURE_ERROR', () => {
    const state = reducer(Map(), {
      type: LITERATURE_ERROR,
      payload: {
        error: { message: 'error' },
      },
    });
    const expected = fromJS({
      loading: false,
      data: initialState.get('data'),
      error: { message: 'error' },
    });
    expect(state).toEqual(expected);
  });

  it('LITERATURE_REFERENCES_REQUEST', () => {
    const state = reducer(Map(), {
      type: LITERATURE_REFERENCES_REQUEST,
      payload: { page: 1, size: 25 },
    });
    const expected = fromJS({
      loadingReferences: true,
      queryReferences: { page: 1, size: 25 },
    });
    expect(state).toEqual(expected);
  });

  it('LITERATURE_REFERENCES_SUCCESS', () => {
    const references = [
      {
        control_number: 12345,
      },
    ];
    const payload = {
      metadata: {
        references,
        references_count: 100,
      },
    };
    const state = reducer(Map(), {
      type: LITERATURE_REFERENCES_SUCCESS,
      payload,
    });
    const expected = fromJS({
      loadingReferences: false,
      references,
      errorReferences: initialState.get('errorReferences'),
      totalReferences: 100,
    });
    expect(state).toEqual(expected);
  });

  it('LITERATURE_REFERENCES_ERROR', () => {
    const state = reducer(Map(), {
      type: LITERATURE_REFERENCES_ERROR,
      payload: {
        error: { message: 'error' },
      },
    });
    const expected = fromJS({
      loadingReferences: false,
      errorReferences: { message: 'error' },
      references: initialState.get('references'),
      totalReferences: initialState.get('totalReferences'),
    });
    expect(state).toEqual(expected);
  });

  it('LITERATURE_AUTHORS_REQUEST', () => {
    const state = reducer(Map(), { type: LITERATURE_AUTHORS_REQUEST });
    const expected = Map({ loadingAuthors: true });
    expect(state).toEqual(expected);
  });

  it('LITERATURE_AUTHORS_SUCCESS', () => {
    const authors = [
      {
        full_name: 'Jessica Jones',
      },
    ];
    const supervisors = [
      {
        full_name: 'John Doe',
      },
    ];
    const payload = {
      metadata: {
        authors,
        supervisors,
      },
    };
    const state = reducer(Map(), {
      type: LITERATURE_AUTHORS_SUCCESS,
      payload,
    });
    const expected = fromJS({
      loadingAuthors: false,
      authors,
      supervisors,
      errorAuthors: initialState.get('errorAuthors'),
    });
    expect(state).toEqual(expected);
  });

  it('LITERATURE_AUTHORS_ERROR', () => {
    const state = reducer(Map(), {
      type: LITERATURE_AUTHORS_ERROR,
      payload: {
        error: { message: 'error' },
      },
    });
    const expected = fromJS({
      loadingAuthors: false,
      errorAuthors: { message: 'error' },
      authors: initialState.get('authors'),
    });
    expect(state).toEqual(expected);
  });

  it('LITERATURE_SELECTION_SET when selected', () => {
    const payload = {
      literatureIds: [2, 3],
      selected: true,
    };
    const currentState = Map({ literatureSelection: Set([1, 2]) });
    const state = reducer(currentState, {
      type: LITERATURE_SELECTION_SET,
      payload,
    });
    const expected = fromJS({
      literatureSelection: Set([1, 2, 3]),
    });
    expect(state).toEqual(expected);
  });

  it('LITERATURE_SELECTION_SET when deselected', () => {
    const payload = {
      literatureIds: [2, 3],
      selected: false,
    };
    const currentState = Map({ literatureSelection: Set([1, 2]) });
    const state = reducer(currentState, {
      type: LITERATURE_SELECTION_SET,
      payload,
    });
    const expected = fromJS({
      literatureSelection: Set([1]),
    });
    expect(state).toEqual(expected);
  });

  it('LITERATURE_SELECTION_CLEAR', () => {
    const currentState = Map({ literatureSelection: Set([1, 2]) });
    const state = reducer(currentState, {
      type: LITERATURE_SELECTION_CLEAR,
    });
    const expected = fromJS({
      literatureSelection: Set(),
    });
    expect(state).toEqual(expected);
  });

  it('LITERATURE_SET_ASSIGN_DRAWER_VISIBILITY', () => {
    const currentState = Map({ isAssignDrawerVisible: false });
    const state = reducer(currentState, {
      type: LITERATURE_SET_ASSIGN_DRAWER_VISIBILITY,
      payload: { visible: true },
    });
    const expected = fromJS({
      isAssignDrawerVisible: true,
    });
    expect(state).toEqual(expected);
  });
});
