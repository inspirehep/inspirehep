import middleware from '../logoutUserOn401';
import { userLogout } from '../../actions/user';

jest.mock('../../actions/user');

describe('LogoutUser middleware', () => {
  let mirrorNext;
  let dispatch;
  let mockDispatch;

  beforeEach(() => {
    mirrorNext = jest.fn(value => value);
    mockDispatch = jest.fn();
    dispatch = middleware({ dispatch: mockDispatch })(mirrorNext);
  });

  afterEach(() => {
    userLogout.mockClear();
  });

  it('dispatches logoutUser for SUBMIT_ERROR 401 and returns result of next(action)', () => {
    const action = {
      type: 'SUBMIT_ERROR',
      payload: { status: 401 },
    };
    const result = dispatch(action);
    expect(result).toBe(action);
    expect(userLogout).toHaveBeenCalled();
  });

  it('only returns result of next(action) when not a SUBMIT_ERROR', () => {
    const action = {
      type: 'SOME_ERROR',
      payload: { status: 401 },
    };
    const result = dispatch(action);
    expect(result).toBe(action);
    expect(userLogout).not.toHaveBeenCalled();
  });

  it('only returns result of next(action) when SUBMIT_ERROR but not 401', () => {
    const action = {
      type: 'SUBMIT_ERROR',
      payload: { status: 503 },
    };
    const result = dispatch(action);
    expect(result).toBe(action);
    expect(userLogout).not.toHaveBeenCalled();
  });
});
