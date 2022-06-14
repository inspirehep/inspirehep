import { Map, fromJS } from 'immutable';

import reducer, { initialState } from '../submissions';
import {
  SUBMIT_SUCCESS,
  SUBMIT_ERROR,
  INITIAL_FORM_DATA_REQUEST,
  INITIAL_FORM_DATA_SUCCESS,
  INITIAL_FORM_DATA_ERROR,
  SUBMIT_REQUEST,
} from '../../actions/actionTypes';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('submissions reducer', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('default', () => {
    const state = reducer(undefined, {});
    const expected = fromJS({
      submitError: null,
      successData: null,
      loadingInitialData: false,
      initialData: null,
      initialDataError: null,
      initialMeta: null,
    });
    // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'expect'. Did you mean 'expected'... Remove this comment to see the full error message
    expect(state).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('SUBMIT_ERROR', () => {
    const submitError = { message: 'Error' };
    const state = reducer(Map(), {
      type: SUBMIT_ERROR,
      payload: { error: submitError },
    });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state.get('submitError')).toEqual(fromJS(submitError));
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('SUBMIT_REQUEST', () => {
    const submitError = { message: 'Error' };
    const successData = { foo: 'bar' };
    const stateWithErrorAndData = fromJS({
      submitError,
      successData,
    });
    const state = reducer(stateWithErrorAndData, { type: SUBMIT_REQUEST });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state.get('successData')).toEqual(initialState.get('successData'));
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state.get('submitError')).toEqual(initialState.get('submitError'));
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('SUBMIT_SUCCESS', () => {
    const submitError = { message: 'Error' };
    const stateWithError = fromJS({
      submitError,
    });
    const data = { cnum: 'C2019-10-10' };
    const state = reducer(stateWithError, {
      type: SUBMIT_SUCCESS,
      payload: data,
    });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state.get('successData')).toEqual(fromJS(data));
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('INITIAL_FORM_DATA_REQUEST', () => {
    const state = reducer(Map(), {
      type: INITIAL_FORM_DATA_REQUEST,
    });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state.get('loadingInitialData')).toBe(true);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('INITIAL_FORM_DATA_SUCCESS', () => {
    const data = {
      control_number: 123,
    };
    const meta = {
      can_modify_status: true,
    };
    const state = reducer(Map(), {
      type: INITIAL_FORM_DATA_SUCCESS,
      payload: { data, meta },
    });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state.get('initialData').toJS()).toEqual(data);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state.get('initialMeta').toJS()).toEqual(meta);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state.get('loadingInitialData')).toBe(false);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state.get('initialDataError')).toEqual(
      initialState.get('initialDataError')
    );
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('INITIAL_FORM_DATA_ERROR', () => {
    const error = {
      message: 'Error',
    };
    const state = reducer(Map(), {
      type: INITIAL_FORM_DATA_ERROR,
      payload: { error },
    });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state.get('initialDataError')).toEqual(fromJS(error));
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state.get('loadingInitialData')).toBe(false);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state.get('initialData')).toEqual(initialState.get('initialData'));
  });
});
