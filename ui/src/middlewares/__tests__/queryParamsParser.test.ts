import { LOCATION_CHANGE } from 'connected-react-router';

import middleware from '../queryParamsParser';


describe('queryParamsParser middleware', () => {
  let next: any;
  let dispatch: any;

  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeEach'.
  beforeEach(() => {
    
    next = jest.fn();
    dispatch = middleware()(next);
  });

  
  it('parses payload.search into payload.query if location changed and continues', () => {
    const action = {
      type: LOCATION_CHANGE,
      payload: { location: { search: '?a=b&c=d' } },
    };
    const expected = {
      type: LOCATION_CHANGE,
      payload: {
        ...action.payload,
        location: {
          ...action.payload.location,
          query: { a: 'b', c: 'd' },
        },
      },
    };
    dispatch(action);
    // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'expect'. Did you mean 'expected'... Remove this comment to see the full error message
    expect(next).toHaveBeenCalledWith(expected);
  });
});
