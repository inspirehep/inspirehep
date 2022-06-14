import { fromJS, List } from 'immutable';

import middleware from '../actionTracker';
import { USER_LOGIN_SUCCESS } from '../../actions/actionTypes';
import { setUserCategoryFromRoles } from '../../tracker';

// @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
jest.mock('../../tracker');

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('actionTracker middleware', () => {
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeEach'.
  beforeEach(() => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'mockClear' does not exist on type '(user... Remove this comment to see the full error message
    setUserCategoryFromRoles.mockClear();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('calls to set user category with roles on LOGIN_SUCCESS', () => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const next = jest.fn();
    const getState = () => ({
      user: fromJS({
        data: {
          roles: ['cataloger'],
        },
      }),
    });
    const dispatch = middleware({ getState })(next);

    const action = {
      type: USER_LOGIN_SUCCESS,
      payload: {
        data: {
          roles: ['cataloger'],
        },
      },
    };

    dispatch(action);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(next).toHaveBeenLastCalledWith(action);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(setUserCategoryFromRoles).toHaveBeenLastCalledWith(
      List(['cataloger'])
    );
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('does nothing on other actions', () => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const next = jest.fn();
    const getState = () => ({});
    const dispatch = middleware({ getState })(next);

    const action = {
      type: 'SOMETHING_ELSE',
      payload: {
        foo: 'bar',
      },
    };
    dispatch(action);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(next).toHaveBeenCalledWith(action);
  });
});
