import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';

import { getStore, mockActionCreator } from '../../../fixtures/store';
import {
  LITERATURE_NS,
  AUTHOR_PUBLICATIONS_NS,
} from '../../../search/constants';

import { fetchCitationSummary } from '../../../actions/citations';
import ExcludeSelfCitationsContainer, {
  UI_EXCLUDE_SELF_CITATIONS_PARAM,
} from '../ExcludeSelfCitationsContainer';
import ExcludeSelfCitations from '../../components/ExcludeSelfCitations';
import { EXCLUDE_SELF_CITATIONS_PREFERENCE } from '../../../reducers/user';
import { appendQueryToLocationSearch } from '../../../actions/router';
import { setPreference } from '../../../actions/user';
import { searchQueryUpdate } from '../../../actions/search';
import {
  CITATION_COUNT_PARAM,
  CITATION_COUNT_WITHOUT_SELF_CITATIONS_PARAM,
} from '../../../common/constants';

jest.mock('../../../actions/citations');
mockActionCreator(fetchCitationSummary);

jest.mock('../../../actions/router');
mockActionCreator(appendQueryToLocationSearch);

jest.mock('../../../actions/search');
mockActionCreator(searchQueryUpdate);

describe('ExcludeSelfCitationsContainer', () => {
  it('dispatches setPreference and fetchCitationSummary when excluded', () => {
    const namespace = LITERATURE_NS;
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <ExcludeSelfCitationsContainer namespace={namespace} />
      </Provider>
    );
    const onChange = wrapper.find(ExcludeSelfCitations).prop('onChange');
    onChange(true);

    const expectedActions = [
      setPreference(EXCLUDE_SELF_CITATIONS_PREFERENCE, true),
      searchQueryUpdate(namespace, {
        [CITATION_COUNT_PARAM]: undefined,
        [CITATION_COUNT_WITHOUT_SELF_CITATIONS_PARAM]: undefined,
      }),
      fetchCitationSummary(namespace),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('also removes excluded self citations param when when not exluced', () => {
    const namespace = AUTHOR_PUBLICATIONS_NS;
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <ExcludeSelfCitationsContainer namespace={namespace} />
      </Provider>
    );
    const onChange = wrapper.find(ExcludeSelfCitations).prop('onChange');
    onChange(false);

    expect(store.getActions()).toContainEqual(
      appendQueryToLocationSearch({
        [UI_EXCLUDE_SELF_CITATIONS_PARAM]: undefined,
      })
    );
  });

  it('sets excluded true if exclude self citations param is present and true', () => {
    const namespace = AUTHOR_PUBLICATIONS_NS;
    const store = getStore({
      router: {
        location: {
          search: `?${UI_EXCLUDE_SELF_CITATIONS_PARAM}=true`,
          query: { [UI_EXCLUDE_SELF_CITATIONS_PARAM]: true },
        },
      },
    });

    const wrapper = mount(
      <Provider store={store}>
        <ExcludeSelfCitationsContainer namespace={namespace} />
      </Provider>
    );
    expect(wrapper.find(ExcludeSelfCitations)).toHaveProp({
      excluded: true,
    });
  });

  it('sets excluded false if exclude self citations param is missing', () => {
    const namespace = AUTHOR_PUBLICATIONS_NS;
    const store = getStore({
      location: {
        search: '?another-thing=5',
        query: { 'another-thing': 5 },
      },
    });

    const wrapper = mount(
      <Provider store={store}>
        <ExcludeSelfCitationsContainer namespace={namespace} />
      </Provider>
    );
    expect(wrapper.find(ExcludeSelfCitations)).toHaveProp({
      excluded: false,
    });
  });

  it('sets preference from state', () => {
    const namespace = AUTHOR_PUBLICATIONS_NS;
    const store = getStore({
      user: fromJS({
        preferences: { [EXCLUDE_SELF_CITATIONS_PREFERENCE]: true },
      }),
    });

    const wrapper = mount(
      <Provider store={store}>
        <ExcludeSelfCitationsContainer namespace={namespace} />
      </Provider>
    );
    expect(wrapper.find(ExcludeSelfCitations)).toHaveProp({
      preference: true,
    });
  });

  it('dispatches appendQueryToLocationSearch onPreferenceChange if the citation summary is enabled', () => {
    const namespace = AUTHOR_PUBLICATIONS_NS;
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <ExcludeSelfCitationsContainer namespace={namespace} />
      </Provider>
    );
    const onPreferenceChange = wrapper
      .find(ExcludeSelfCitations)
      .prop('onPreferenceChange');
    onPreferenceChange(true);

    const expectedActions = [
      appendQueryToLocationSearch({ [UI_EXCLUDE_SELF_CITATIONS_PARAM]: true }),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
