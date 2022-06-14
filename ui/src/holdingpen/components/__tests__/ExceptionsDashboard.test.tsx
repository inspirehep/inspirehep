import React from 'react';
import { shallow } from 'enzyme';
import ExceptionsDashboard from '../ExceptionsDashboard';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('ExceptionsDashboard', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with all props set', () => {
    const exceptions = [
      {
        collection: 'Job',
        error: 'Job Error 1',
        recid: 1512550,
      },
      {
        collection: 'Hep',
        error: 'Hep Error 2',
        recid: 1238165,
      },
      {
        collection: 'Conferences',
        error: 'Conferences Error 1',
        recid: 1356791,
      },
      {
        collection: 'Hep',
        error: 'Hep Error 1',
        recid: 1635467,
      },
    ];
    const loading = false;
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ exceptions: { collection: string; error: s... Remove this comment to see the full error message
      <ExceptionsDashboard exceptions={exceptions} loading={loading} />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with all props set and loading set to true', () => {
    const exceptions: any = [];
    const loading = true;
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ exceptions: any; loading: boolean; }' is n... Remove this comment to see the full error message
      <ExceptionsDashboard exceptions={exceptions} loading={loading} />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('getExceptionCountEntriesByCollection', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns exceptions count entries', () => {
      const exceptions = [
        {
          collection: 'Hep',
        },
        {
          collection: 'Hep',
        },
        {
          collection: 'Job',
        },
        {
          collection: 'Conferences',
        },
      ];
      const expected = [['Job', 1], ['Hep', 2], ['Conferences', 1]];
      const result = ExceptionsDashboard.getExceptionCountEntriesByCollection(
        exceptions
      );
      // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'expect'. Did you mean 'expected'... Remove this comment to see the full error message
      expect(result.sort()).toEqual(expected.sort());
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns empty array if exceptions empty', () => {
      const exceptions: any = [];
      const expected: any = [];
      const result = ExceptionsDashboard.getExceptionCountEntriesByCollection(
        exceptions
      );
      // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'expect'. Did you mean 'expected'... Remove this comment to see the full error message
      expect(result).toEqual(expected);
    });
  });
});
