import { replace } from 'connected-react-router';

import middleware from '../redirectToErrorPage';
import { ERRORS } from '../../common/routes';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('redirectToErrorPage middleware', () => {
  let mirrorNext;
  let dispatch: any;
  let mockDispatch: any;

  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeEach'.
  beforeEach(() => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    mirrorNext = jest.fn((value: any) => value);
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    mockDispatch = jest.fn();
    dispatch = middleware({ dispatch: mockDispatch })(mirrorNext);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('dispatches push to error page when redirectable error and returns result of next(action)', () => {
    const action = {
      type: 'SOME_ERROR',
      payload: {
        error: { status: 500 }
      },
      meta: { redirectableError: true },
    };
    const result = dispatch(action);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(result).toBe(action);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(mockDispatch).toHaveBeenCalledWith(replace(`${ERRORS}/500`));
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('only returns result of next(action) when not a redirectable error', () => {
    const action = {
      type: 'SOME_ERROR',
      payload: {
        error: { status: 500 }
      },
    };
    const result = dispatch(action);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(result).toBe(action);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(mockDispatch).not.toHaveBeenCalledWith(replace(`${ERRORS}/500`));
  });
});
