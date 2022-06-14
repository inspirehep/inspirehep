import React from 'react';
import { shallow } from 'enzyme';
import ExceptionsTable from '../ExceptionsTable';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('ExceptionsTable', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    const loading = false;
    const wrapper = shallow(
      <ExceptionsTable exceptions={exceptions} loading={loading} />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders when loading is true', () => {
    const exceptions: $TSFixMe = [];
    const loading = true;
    const wrapper = shallow(
      <ExceptionsTable exceptions={exceptions} loading={loading} />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    const loading = false;
    const searchText = 'MyError';
    const wrapper = shallow(
      <ExceptionsTable exceptions={exceptions} loading={loading} />
    );
    (wrapper.instance() as $TSFixMe).onErrorSearch(searchText);
    wrapper.update();
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    const loading = false;
    const wrapper = shallow(
      <ExceptionsTable exceptions={exceptions} loading={loading} />
    );
    (wrapper.instance() as $TSFixMe).onErrorSearch(searchText);
    wrapper.update();
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    const loading = false;
    const wrapper = shallow(
      <ExceptionsTable exceptions={exceptions} loading={loading} />
    );
    (wrapper.instance() as $TSFixMe).onErrorSearch(searchText);
    wrapper.update();
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    const loading = false;
    const wrapper = shallow(
      <ExceptionsTable exceptions={exceptions} loading={loading} />
    );
    (wrapper.instance() as $TSFixMe).onRecidSearch(recidText);
    wrapper.update();
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    const loading = false;
    const wrapper = shallow(
      <ExceptionsTable exceptions={exceptions} loading={loading} />
    );
    (wrapper.instance() as $TSFixMe).onRecidSearch(recidText);
    wrapper.update();
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    const loading = false;
    const wrapper = shallow(
      <ExceptionsTable exceptions={exceptions} loading={loading} />
    );
    (wrapper.instance() as $TSFixMe).onRecidSearch(recidText);
    wrapper.update();
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('getCollectionColumnFilters', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result.sort()).toEqual(expected.sort());
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns empty array if expections empty', () => {
      const exceptions: $TSFixMe = [];
      const expected: $TSFixMe = [];
      const result = ExceptionsTable.getCollectionColumnFilters(exceptions);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toEqual(expected);
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('hasCollection', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns true if exception.collection equals to passed collection', () => {
      const exception = {
        collection: 'Hep',
      };
      const result = ExceptionsTable.hasCollection('Hep', exception);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toBe(true);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns false if expcetion.collection does not equal to passed collection', () => {
      const exception = {
        collection: 'Hep',
      };
      const result = ExceptionsTable.hasCollection('Not Hep', exception);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toBe(false);
    });
  });
});
