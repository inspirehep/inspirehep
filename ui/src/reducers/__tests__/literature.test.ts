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

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('literature reducer', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('default', () => {
    const state = reducer(undefined, {});
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(initialState);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('CLEAR_STATE', () => {
    const currentState = fromJS({
      data: {
        control_number: 123456,
      },
    });
    const state = reducer(currentState, { type: CLEAR_STATE });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(initialState);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('LITERATURE_REQUEST', () => {
    const state = reducer(Map(), { type: LITERATURE_REQUEST });
    const expected = Map({ loading: true });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('LITERATURE_REFERENCES_REQUEST', () => {
    const state = reducer(Map(), {
      type: LITERATURE_REFERENCES_REQUEST,
      payload: 1,
    });
    const expected = fromJS({
      loadingReferences: true,
      pageReferences: 1,
    });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('LITERATURE_AUTHORS_REQUEST', () => {
    const state = reducer(Map(), { type: LITERATURE_AUTHORS_REQUEST });
    const expected = Map({ loadingAuthors: true });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('LITERATURE_SELECTION_CLEAR', () => {
    const currentState = Map({ literatureSelection: Set([1, 2]) });
    const state = reducer(currentState, {
      type: LITERATURE_SELECTION_CLEAR,
    });
    const expected = fromJS({
      literatureSelection: Set(),
    });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('LITERATURE_SET_ASSIGN_DRAWER_VISIBILITY', () => {
    const currentState = Map({ isAssignDrawerVisible: false });
    const state = reducer(currentState, {
      type: LITERATURE_SET_ASSIGN_DRAWER_VISIBILITY,
      payload: { visible: true },
    });
    const expected = fromJS({
      isAssignDrawerVisible: true,
    });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(expected);
  });
});
