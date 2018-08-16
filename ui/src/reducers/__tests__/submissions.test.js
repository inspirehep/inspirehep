import { Map, fromJS } from 'immutable';

import reducer, {
  initialState,
  authorSubmitErrorPath,
  loadingAuthorUpdateDataPath,
  authorUpdateDataPath,
  authorUpdateDataErrorPath,
} from '../submissions';
import {
  AUTHOR_SUBMIT_SUCCESS,
  AUTHOR_SUBMIT_ERROR,
  AUTHOR_UPDATE_FORM_DATA_REQUEST,
  AUTHOR_UPDATE_FORM_DATA_SUCCESS,
  AUTHOR_UPDATE_FORM_DATA_ERROR,
} from '../../actions/actionTypes';

describe('submissions reducer', () => {
  it('default', () => {
    const state = reducer(undefined, {});
    const expected = fromJS({
      author: {
        submitError: null,
        loadingUpdateData: false,
        updateData: null,
        updateDataError: null,
      },
    });
    expect(state).toEqual(expected);
  });

  it('AUTHOR_SUBMIT_ERROR', () => {
    const submitError = { message: 'Error' };
    const state = reducer(Map(), {
      type: AUTHOR_SUBMIT_ERROR,
      payload: submitError,
    });
    expect(state.getIn(authorSubmitErrorPath)).toEqual(fromJS(submitError));
  });

  it('AUTHOR_SUBMIT_SUCCESS', () => {
    const submitError = { message: 'Error' };
    const stateWithError = fromJS({
      author: { submitError },
    });
    const state = reducer(stateWithError, { type: AUTHOR_SUBMIT_SUCCESS });
    expect(state.getIn(authorSubmitErrorPath)).toEqual(
      initialState.getIn(authorSubmitErrorPath)
    );
  });

  it('AUTHOR_UPDATE_FORM_DATA_REQUEST', () => {
    const state = reducer(Map(), {
      type: AUTHOR_UPDATE_FORM_DATA_REQUEST,
      payload: {
        recordId: '123',
      },
    });
    expect(state.getIn(loadingAuthorUpdateDataPath)).toBe(true);
  });

  it('AUTHOR_UPDATE_FORM_DATA_SUCCESS', () => {
    const data = fromJS({
      control_number: 123,
    });
    const state = reducer(Map(), {
      type: AUTHOR_UPDATE_FORM_DATA_SUCCESS,
      payload: { data },
    });
    expect(state.getIn(authorUpdateDataPath)).toEqual(data);
    expect(state.getIn(loadingAuthorUpdateDataPath)).toBe(false);
    expect(state.getIn(authorUpdateDataErrorPath)).toEqual(
      initialState.getIn(authorUpdateDataErrorPath)
    );
  });

  it('AUTHOR_UPDATE_FORM_DATA_ERROR', () => {
    const error = fromJS({
      message: 'Error',
    });
    const state = reducer(Map(), {
      type: AUTHOR_UPDATE_FORM_DATA_ERROR,
      payload: error,
    });
    expect(state.getIn(authorUpdateDataErrorPath)).toEqual(error);
    expect(state.getIn(loadingAuthorUpdateDataPath)).toBe(false);
    expect(state.getIn(authorUpdateDataPath)).toEqual(
      initialState.getIn(authorUpdateDataPath)
    );
  });
});
