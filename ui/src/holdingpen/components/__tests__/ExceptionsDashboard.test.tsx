import React from 'react';
import { shallow } from 'enzyme';
import ExceptionsDashboard from '../ExceptionsDashboard';


describe('ExceptionsDashboard', () => {
  
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
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('renders with all props set and loading set to true', () => {
    const exceptions: any = [];
    const loading = true;
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ exceptions: any; loading: boolean; }' is n... Remove this comment to see the full error message
      <ExceptionsDashboard exceptions={exceptions} loading={loading} />
    );
    
    expect(wrapper).toMatchSnapshot();
  });

  
  describe('getExceptionCountEntriesByCollection', () => {
    
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
