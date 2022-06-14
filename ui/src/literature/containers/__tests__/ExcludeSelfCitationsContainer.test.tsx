import React from 'react';
import { mount } from 'enzyme';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
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

// @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
jest.mock('../../../actions/citations');
mockActionCreator(fetchCitationSummary);

// @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
jest.mock('../../../actions/router');
mockActionCreator(appendQueryToLocationSearch);

// @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
jest.mock('../../../actions/search');
mockActionCreator(searchQueryUpdate);

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('ExcludeSelfCitationsContainer', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(store.getActions()).toEqual(expectedActions);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(store.getActions()).toContainEqual(
      appendQueryToLocationSearch({
        [UI_EXCLUDE_SELF_CITATIONS_PARAM]: undefined,
      })
    );
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(ExcludeSelfCitations)).toHaveProp({
      excluded: true,
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(ExcludeSelfCitations)).toHaveProp({
      excluded: false,
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(ExcludeSelfCitations)).toHaveProp({
      preference: true,
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(store.getActions()).toEqual(expectedActions);
  });
});
