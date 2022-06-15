import { LOCATION_CHANGE } from 'connected-react-router';

import middleware from '../keepPreviousUrl';


describe('keepPreviousUrl middleware', () => {
  let next: any;
  let dispatch: any;

  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeEach'.
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
    // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'expect'. Did you mean 'expected'... Remove this comment to see the full error message
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
