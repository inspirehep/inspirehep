import { Map, fromJS, Set } from 'immutable';

import reducer, { initialState } from '../authors';
import {
  AUTHOR_ERROR,
  AUTHOR_REQUEST,
  AUTHOR_SUCCESS,
  CLEAR_STATE,
  AUTHOR_PUBLICATION_SELECTION_SET,
  AUTHOR_PUBLICATION_SELECTION_CLEAR,
  AUTHOR_SET_ASSIGN_DRAWER_VISIBILITY,
  AUTHOR_PUBLICATION_CLAIM_SELECTION,
  AUTHOR_PUBLICATIONS_CLAIM_CLEAR,
  AUTHOR_PUBLICATION_UNCLAIM_SELECTION,
  AUTHOR_PUBLICATION_CAN_NOT_CLAIM_CLEAR,
  AUTHOR_PUBLICATIONS_UNCLAIM_CLEAR,
  AUTHOR_PUBLICATION_CAN_NOT_CLAIM_SELECTION,
} from '../../actions/actionTypes';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('authors reducer', () => {
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
        metadata: {
          control_number: 123456,
        },
      },
    });
    const state = reducer(currentState, { type: CLEAR_STATE });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(initialState);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('AUTHOR_REQUEST', () => {
    const state = reducer(Map(), { type: AUTHOR_REQUEST });
    const expected = Map({ loading: true });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('AUTHOR_SUCCESS', () => {
    const payload = {
      metadata: {
        name: [
          {
            value: 'Jessica Jones',
          },
        ],
        facet_author_name: 'Jessica.J.1',
      },
    };
    const state = reducer(Map(), { type: AUTHOR_SUCCESS, payload });
    const expected = fromJS({
      loading: false,
      data: payload,
      error: initialState.get('error'),
    });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('AUTHOR_ERROR', () => {
    const state = reducer(Map(), {
      type: AUTHOR_ERROR,
      payload: {
        error: { message: 'error' },
      },
    });
    const expected = fromJS({
      loading: false,
      error: { message: 'error' },
      data: initialState.get('data'),
    });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('AUTHOR_PUBLICATION_SELECTION_SET when selected', () => {
    const payload = {
      publicationIds: [2, 3],
      selected: true,
    };
    const currentState = Map({ publicationSelection: Set([1, 2]) });
    const state = reducer(currentState, {
      type: AUTHOR_PUBLICATION_SELECTION_SET,
      payload,
    });
    const expected = fromJS({
      publicationSelection: Set([1, 2, 3]),
    });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('AUTHOR_PUBLICATION_SELECTION_SET when deselected', () => {
    const payload = {
      publicationIds: [2, 3],
      selected: false,
    };
    const currentState = Map({ publicationSelection: Set([1, 2]) });
    const state = reducer(currentState, {
      type: AUTHOR_PUBLICATION_SELECTION_SET,
      payload,
    });
    const expected = fromJS({
      publicationSelection: Set([1]),
    });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('AUTHOR_PUBLICATION_SELECTION_CLEAR', () => {
    const currentState = Map({ publicationSelection: Set([1, 2]) });
    const state = reducer(currentState, {
      type: AUTHOR_PUBLICATION_SELECTION_CLEAR,
    });
    const expected = fromJS({
      publicationSelection: Set(),
    });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('AUTHOR_PUBLICATION_CLAIM_SELECTION when selected', () => {
    const payload = {
      papersIds: [1, 2],
      selected: true,
    };
    const currentState = Map({
      publicationSelection: Set([2, 3]),
      publicationSelectionClaimed: Set([2, 3]),
    });
    const state = reducer(currentState, {
      type: AUTHOR_PUBLICATION_CLAIM_SELECTION,
      payload,
    });
    const expected = Set([2, 3, 1]);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state.get('publicationSelectionClaimed')).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('AUTHOR_PUBLICATION_CLAIM_SELECTION when deselected', () => {
    const payload = {
      papersIds: [2],
      selected: false,
    };
    const currentState = Map({
      publicationSelection: Set([1, 2]),
      publicationSelectionClaimed: Set([1, 2]),
    });
    const state = reducer(currentState, {
      type: AUTHOR_PUBLICATION_CLAIM_SELECTION,
      payload,
    });
    const expected = Set([1]);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state.get('publicationSelectionClaimed')).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('AUTHOR_PUBLICATIONS_CLAIM_CLEAR', () => {
    const currentState = Map({
      publicationSelection: Set([1, 2]),
      publicationSelectionClaimed: [1, 2],
    });
    const state = reducer(currentState, {
      type: AUTHOR_PUBLICATIONS_CLAIM_CLEAR,
    });
    const expected = Set([]);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state.get('publicationSelectionClaimed')).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('AUTHOR_PUBLICATION_UNCLAIM_SELECTION when selected', () => {
    const payload = {
      papersIds: [1, 2],
      selected: true,
    };
    const currentState = Map({
      publicationSelection: Set([2, 3]),
      publicationSelectionUnclaimed: Set([2, 3]),
    });
    const state = reducer(currentState, {
      type: AUTHOR_PUBLICATION_UNCLAIM_SELECTION,
      payload,
    });
    const expected = Set([2, 3, 1]);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state.get('publicationSelectionUnclaimed')).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('AUTHOR_PUBLICATION_UNCLAIM_SELECTION when deselected', () => {
    const payload = {
      papersIds: [2],
      selected: false,
    };
    const currentState = Map({
      publicationSelection: Set([1, 2]),
      publicationSelectionUnclaimed: Set([1, 2]),
    });
    const state = reducer(currentState, {
      type: AUTHOR_PUBLICATION_UNCLAIM_SELECTION,
      payload,
    });
    const expected = Set([1]);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state.get('publicationSelectionUnclaimed')).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('AUTHOR_PUBLICATION_CAN_NOT_CLAIM_SELECTION when selected', () => {
    const payload = {
      papersIds: [1, 2],
      selected: true,
    };
    const currentState = Map({
      publicationSelection: Set([2, 3]),
      publicationSelectionCanNotClaim: Set([2, 3]),
    });
    const state = reducer(currentState, {
      type: AUTHOR_PUBLICATION_CAN_NOT_CLAIM_SELECTION,
      payload,
    });
    const expected = Set([2, 3, 1]);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state.get('publicationSelectionCanNotClaim')).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('AUTHOR_PUBLICATION_CAN_NOT_CLAIM_SELECTION when deselected', () => {
    const payload = {
      papersIds: [2],
      selected: false,
    };
    const currentState = Map({
      publicationSelection: Set([1, 2]),
      publicationSelectionCanNotClaim: Set([1, 2]),
    });
    const state = reducer(currentState, {
      type: AUTHOR_PUBLICATION_CAN_NOT_CLAIM_SELECTION,
      payload,
    });
    const expected = Set([1]);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state.get('publicationSelectionCanNotClaim')).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('AUTHOR_PUBLICATIONS_UNCLAIM_CLEAR', () => {
    const currentState = Map({
      publicationSelection: Set([1, 2]),
      publicationSelectionUnclaimed: [1, 2],
    });
    const state = reducer(currentState, {
      type: AUTHOR_PUBLICATIONS_UNCLAIM_CLEAR,
    });
    const expected = Set([]);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state.get('publicationSelectionUnclaimed')).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('AUTHOR_PUBLICATION_CAN_NOT_CLAIM_CLEAR', () => {
    const currentState = Map({
      publicationSelection: Set([1, 2]),
      publicationSelectionCanNotClaim: Set([1, 2]),
      publicationSelectionClaimed: Set([1, 2]),
    });
    const state = reducer(currentState, {
      type: AUTHOR_PUBLICATION_CAN_NOT_CLAIM_CLEAR,
    });
    const expected = Set([]);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state.get('publicationSelectionCanNotClaim')).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('AUTHOR_SET_ASSIGN_DRAWER_VISIBILITY', () => {
    const currentState = Map({ isAssignDrawerVisible: false });
    const state = reducer(currentState, {
      type: AUTHOR_SET_ASSIGN_DRAWER_VISIBILITY,
      payload: { visible: true },
    });
    const expected = fromJS({
      isAssignDrawerVisible: true,
    });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(expected);
  });
});
