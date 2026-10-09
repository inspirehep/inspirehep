import { fromJS } from 'immutable';
import { parse } from 'qs';

import SearchHelper from '../helper';
import { LITERATURE_NS } from '../constants';

function getState({ searchQuery, locationQuery }) {
  return {
    search: fromJS({
      namespaces: {
        [LITERATURE_NS]: {
          query: searchQuery,
          baseQuery: { page: '1', size: '25' },
        },
      },
    }),
    router: {
      location: {
        pathname: '/literature',
        query: locationQuery,
      },
    },
  };
}

function getHelper(stateConfig, dispatch = vi.fn()) {
  const state = getState(stateConfig);
  return new SearchHelper(LITERATURE_NS, state, state, dispatch, false);
}

describe('SearchHelper', () => {
  describe('getLocationQueryString', () => {
    it('drops a stale ui- param that is no longer on the location', () => {
      const helper = getHelper({
        searchQuery: {
          q: 'higgs',
          sort: 'mostrecent',
          page: '1',
          size: '25',
          'ui-citation-summary': 'true',
        },
        locationQuery: {
          q: 'higgs',
          sort: 'mostrecent',
          page: '1',
          size: '25',
        },
      });

      const result = parse(helper.getLocationQueryString());

      expect(result['ui-citation-summary']).toBeUndefined();
      expect(result).toEqual({
        q: 'higgs',
        sort: 'mostrecent',
        page: '1',
        size: '25',
      });
    });

    it('keeps a ui- param that is present on the location', () => {
      const helper = getHelper({
        searchQuery: {
          q: 'higgs',
          sort: 'mostrecent',
          'ui-citation-summary': 'true',
        },
        locationQuery: {
          q: 'higgs',
          sort: 'mostrecent',
          'ui-citation-summary': 'true',
        },
      });

      const result = parse(helper.getLocationQueryString());

      expect(result['ui-citation-summary']).toEqual('true');
    });

    it('adds a ui- param present only on the location', () => {
      const helper = getHelper({
        searchQuery: { q: 'higgs', sort: 'mostrecent' },
        locationQuery: {
          q: 'higgs',
          sort: 'mostrecent',
          'ui-exclude-self-citations': 'true',
        },
      });

      const result = parse(helper.getLocationQueryString());

      expect(result['ui-exclude-self-citations']).toEqual('true');
    });

    it('handles a missing location query', () => {
      const helper = getHelper({
        searchQuery: { q: 'higgs', 'ui-citation-summary': 'true' },
        locationQuery: undefined,
      });

      const result = parse(helper.getLocationQueryString());

      expect(result).toEqual({ q: 'higgs' });
    });
  });

  describe('updateLocation', () => {
    it('navigates without the stale ui- param', () => {
      const dispatch = vi.fn();
      const helper = getHelper(
        {
          searchQuery: {
            q: 'higgs',
            sort: 'mostrecent',
            page: '1',
            size: '25',
            'ui-citation-summary': 'true',
          },
          locationQuery: {
            q: 'higgs',
            sort: 'mostrecent',
            page: '1',
            size: '25',
          },
        },
        dispatch
      );

      helper.updateLocation();

      expect(dispatch).toHaveBeenCalledTimes(1);
      const dispatched = JSON.stringify(dispatch.mock.calls);
      expect(dispatched).toContain('sort=mostrecent');
      expect(dispatched).not.toContain('ui-citation-summary');
    });
  });
});
