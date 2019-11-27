import { replace } from 'connected-react-router';

import middleware from '../redirectToErrorPage';
import { ERRORS } from '../../common/routes';

describe('redirectToErrorPage middleware', () => {
  let mirrorNext;
  let dispatch;
  let mockDispatch;

  beforeEach(() => {
    mirrorNext = jest.fn(value => value);
    mockDispatch = jest.fn();
    dispatch = middleware({ dispatch: mockDispatch })(mirrorNext);
  });

  it('dispatches push to error page when redirectable error and returns result of next(action)', () => {
    const action = {
      type: 'SOME_ERROR',
      payload: { status: 500 },
      meta: { redirectableError: true },
    };
    const result = dispatch(action);
    expect(result).toBe(action);
    expect(mockDispatch).toHaveBeenCalledWith(replace(`${ERRORS}/500`));
  });

  it('only returns result of next(action) when not a redirectable error', () => {
    const action = {
      type: 'SOME_ERROR',
      payload: { status: 500 },
    };
    const result = dispatch(action);
    expect(result).toBe(action);
    expect(mockDispatch).not.toHaveBeenCalledWith(replace(`${ERRORS}/500`));
  });
});
