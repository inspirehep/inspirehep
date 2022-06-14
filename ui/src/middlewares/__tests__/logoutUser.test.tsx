import middleware from '../logoutUserOn401';
import { userLogout } from '../../actions/user';

// @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
jest.mock('../../actions/user');

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('LogoutUser middleware', () => {
  let mirrorNext;
  let dispatch: any;
  let mockDispatch;

  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeEach'.
  beforeEach(() => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    mirrorNext = jest.fn((value: any) => value);
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    mockDispatch = jest.fn();
    dispatch = middleware({ dispatch: mockDispatch })(mirrorNext);
  });

  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'afterEach'.
  afterEach(() => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'mockClear' does not exist on type '() =>... Remove this comment to see the full error message
    userLogout.mockClear();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('dispatches logoutUser for SUBMIT_ERROR 401 and returns result of next(action)', () => {
    const action = {
      type: 'SUBMIT_ERROR',
      payload: { status: 401 },
    };
    const result = dispatch(action);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(result).toBe(action);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(userLogout).toHaveBeenCalled();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('only returns result of next(action) when not a SUBMIT_ERROR', () => {
    const action = {
      type: 'SOME_ERROR',
      payload: { status: 401 },
    };
    const result = dispatch(action);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(result).toBe(action);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(userLogout).not.toHaveBeenCalled();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('only returns result of next(action) when SUBMIT_ERROR but not 401', () => {
    const action = {
      type: 'SUBMIT_ERROR',
      payload: { status: 503 },
    };
    const result = dispatch(action);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(result).toBe(action);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(userLogout).not.toHaveBeenCalled();
  });
});
