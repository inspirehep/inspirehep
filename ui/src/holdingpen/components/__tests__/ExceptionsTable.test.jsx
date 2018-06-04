import React from 'react';
import { shallow } from 'enzyme';
import ExceptionsTable from '../ExceptionsTable';

describe('ExceptionsTable', () => {
  it('renders with exceptions', () => {
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
        collection: 'Hep',
        error: 'Hep Error 1',
        recid: 1635467,
      },
    ];
    const wrapper = shallow(<ExceptionsTable exceptions={exceptions} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders filtered results on error search', () => {
    const exceptions = [
      {
        collection: 'Job',
        error: 'Foo MyError',
        recid: 1512550,
      },
      {
        collection: 'Hep',
        error: 'MyError Bar',
        recid: 1238165,
      },
      {
        collection: 'Hep',
        error: 'Another Thing',
        recid: 1635467,
      },
    ];
    const searchText = 'MyError';
    const wrapper = shallow(<ExceptionsTable exceptions={exceptions} />);
    wrapper.instance().onErrorSearch(searchText);
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });

  it('renders no results on error search if nothing matches', () => {
    const exceptions = [
      {
        collection: 'Job',
        error: 'Error 1',
        recid: 1512550,
      },
      {
        collection: 'Hep',
        error: 'Error 2',
        recid: 1238165,
      },
      {
        collection: 'Hep',
        error: 'Error 3',
        recid: 1635467,
      },
    ];
    const searchText = 'Thing';
    const wrapper = shallow(<ExceptionsTable exceptions={exceptions} />);
    wrapper.instance().onErrorSearch(searchText);
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });

  it('renders all exceptions on clear error search', () => {
    const exceptions = [
      {
        collection: 'Job',
        error: 'Error 1',
        recid: 1512550,
      },
      {
        collection: 'Hep',
        error: 'Error 2',
        recid: 1238165,
      },
      {
        collection: 'Hep',
        error: 'Error 3',
        recid: 1635467,
      },
    ];
    const searchText = '';
    const wrapper = shallow(<ExceptionsTable exceptions={exceptions} />);
    wrapper.instance().onErrorSearch(searchText);
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });

  it('renders no results on recid search if there is no exact match', () => {
    const exceptions = [
      {
        collection: 'Job',
        error: 'Error 1',
        recid: 12345,
      },
      {
        collection: 'Hep',
        error: 'Error 2',
        recid: 12346,
      },
      {
        collection: 'Hep',
        error: 'Error 3',
        recid: 54321,
      },
    ];
    const recidText = '1234';
    const wrapper = shallow(<ExceptionsTable exceptions={exceptions} />);
    wrapper.instance().onRecidSearch(recidText);
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });

  it('renders single exception on recid search if there is exact match', () => {
    const exceptions = [
      {
        collection: 'Job',
        error: 'Error 1',
        recid: 12345,
      },
      {
        collection: 'Hep',
        error: 'Error 2',
        recid: 12346,
      },
      {
        collection: 'Hep',
        error: 'Error 3',
        recid: 54321,
      },
    ];
    const recidText = '12345';
    const wrapper = shallow(<ExceptionsTable exceptions={exceptions} />);
    wrapper.instance().onRecidSearch(recidText);
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });

  it('renders all exceptions on clear recid search', () => {
    const exceptions = [
      {
        collection: 'Job',
        error: 'Error 1',
        recid: 12345,
      },
      {
        collection: 'Hep',
        error: 'Error 2',
        recid: 12346,
      },
      {
        collection: 'Hep',
        error: 'Error 3',
        recid: 54321,
      },
    ];
    const recidText = '';
    const wrapper = shallow(<ExceptionsTable exceptions={exceptions} />);
    wrapper.instance().onRecidSearch(recidText);
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });

  describe('getCollectionColumnFilters', () => {
    it('returns collection column filters', () => {
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
      ];
      const expected = [
        { text: 'Hep', value: 'Hep' },
        { text: 'Job', value: 'Job' },
      ];
      const result = ExceptionsTable.getCollectionColumnFilters(exceptions);
      expect(result.sort()).toEqual(expected.sort());
    });

    it('returns empty array if expections empty', () => {
      const exceptions = [];
      const expected = [];
      const result = ExceptionsTable.getCollectionColumnFilters(exceptions);
      expect(result).toEqual(expected);
    });
  });

  describe('hasCollection', () => {
    it('returns true if exception.collection equals to passed collection', () => {
      const exception = {
        collection: 'Hep',
      };
      const result = ExceptionsTable.hasCollection('Hep', exception);
      expect(result).toBe(true);
    });

    it('returns false if expcetion.collection does not equal to passed collection', () => {
      const exception = {
        collection: 'Hep',
      };
      const result = ExceptionsTable.hasCollection('Not Hep', exception);
      expect(result).toBe(false);
    });
  });
});
