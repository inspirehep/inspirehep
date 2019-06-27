import { LOCATION_CHANGE } from 'connected-react-router';

import middleware from '../keepPreviousUrl';

describe('keepPreviousUrl middleware', () => {
  let next;
  let dispatch;

  beforeEach(() => {
    next = jest.fn();
    dispatch = middleware()(next);
  });

  it('adds previous url to action payload if location change', () => {
    const previous = {
      type: LOCATION_CHANGE,
      payload: {
        location: {
          pathname: '/previousPathname',
          search: '?previous=1',
        },
      },
    };
    const action = {
      type: LOCATION_CHANGE,
      payload: {
        location: {
          pathname: '/nextPathname',
          search: '?next=1',
        },
      },
    };
    const expected = {
      type: LOCATION_CHANGE,
      payload: {
        location: {
          pathname: '/nextPathname',
          search: '?next=1',
          previousUrl: '/previousPathname?previous=1',
        },
      },
    };
    dispatch(previous);
    dispatch(action);
    expect(next).toHaveBeenLastCalledWith(expected);
  });

  it('does nothing if not location change', () => {
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
