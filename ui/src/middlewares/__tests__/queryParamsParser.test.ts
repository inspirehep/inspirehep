import { LOCATION_CHANGE } from 'connected-react-router';

import middleware from '../queryParamsParser';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('queryParamsParser middleware', () => {
  let next: any;
  let dispatch: any;

  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeEach'.
  beforeEach(() => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    next = jest.fn();
    dispatch = middleware()(next);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
