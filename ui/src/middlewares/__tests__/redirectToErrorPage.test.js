import { replace } from 'connected-react-router';

import middleware from '../redirectToErrorPage';
import { ERRORS } from '../../common/routes';

describe('redirectToErrorPage middleware', () => {
  let mirrorNext;
  let dispatch;
  let mockDispatch;
  let mockLocationAssign;

  beforeEach(() => {
    mirrorNext = jest.fn(value => value);
    mockDispatch = jest.fn();
    // eslint-disable-next-line no-multi-assign
    mockLocationAssign = window.location.assign = jest.fn();
    dispatch = middleware({ dispatch: mockDispatch })(mirrorNext);
  });

  it('dispatches push to error page when redirectable error and returns result of next(action)', () => {
    const action = {
      type: 'SOME_ERROR',
      payload: {
        error: { status: 500 }
      },
      meta: { redirectableError: true },
    };
    const result = dispatch(action);
    expect(result).toBe(action);
    expect(mockLocationAssign).toBeCalledWith(`${ERRORS}/500`);
  });

  it('only returns result of next(action) when not a redirectable error', () => {
    const action = {
      type: 'SOME_ERROR',
      payload: {
        error: { status: 500 }
      },
    };
    const result = dispatch(action);
    expect(result).toBe(action);
    expect(mockDispatch).not.toHaveBeenCalledWith(replace(`${ERRORS}/500`));
  });
});
