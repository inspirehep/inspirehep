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
      <ExceptionsDashboard exceptions={exceptions} loading={loading} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with all props set and loading set to true', () => {
    const exceptions = [];
    const loading = true;
    const wrapper = shallow(
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
      expect(result.sort()).toEqual(expected.sort());
    });

    it('returns empty array if exceptions empty', () => {
      const exceptions = [];
      const expected = [];
      const result = ExceptionsDashboard.getExceptionCountEntriesByCollection(
        exceptions
      );
      expect(result).toEqual(expected);
    });
  });
});
