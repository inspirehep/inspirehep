import { fromJS, Set } from 'immutable';

import middleware from '../actionTracker';
import { USER_LOGIN_SUCCESS } from '../../actions/actionTypes';
import * as tracker from '../../tracker';

jest.mock('../../tracker');

describe('actionTracker middleware', () => {
  it('calls to set user category with roles on LOGIN_SUCCESS', () => {
    tracker.setUserCategoryFromRoles = jest.fn();
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
    expect(next).toHaveBeenLastCalledWith(action);
    expect(tracker.setUserCategoryFromRoles).toHaveBeenLastCalledWith(
      Set(['cataloger'])
    );
  });

  it('does nothing on other actions', () => {
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
    expect(next).toHaveBeenCalledWith(action);
  });
});
