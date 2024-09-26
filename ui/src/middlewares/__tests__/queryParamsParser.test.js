import { LOCATION_CHANGE } from 'connected-react-router';

import middleware from '../queryParamsParser';

describe('queryParamsParser middleware', () => {
  let next;
  let dispatch;

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
    expect(next).toHaveBeenCalledWith(expected);
  });
});
