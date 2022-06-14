import React from 'react';
import { mount } from 'enzyme';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';

import {
  getStore,
  getStoreWithState,
  mockActionCreator,
} from '../../../fixtures/store';
import CitationSummarySwitchContainer, {
  UI_CITATION_SUMMARY_PARAM,
} from '../CitationSummarySwitchContainer';
import CitationSummarySwitch from '../../components/CitationSummarySwitch';
import { appendQueryToLocationSearch } from '../../../actions/router';
import { CITATION_SUMMARY_ENABLING_PREFERENCE } from '../../../reducers/user';
import {
  LITERATURE_NS,
  AUTHOR_PUBLICATIONS_NS,
} from '../../../search/constants';
import { setPreference } from '../../../actions/user';
import { fetchCitationSummary } from '../../../actions/citations';

// @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
jest.mock('../../../actions/router');
mockActionCreator(appendQueryToLocationSearch);

// @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
jest.mock('../../../actions/citations');
mockActionCreator(fetchCitationSummary);

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('CitationSummarySwitchContainer', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('dispatches setPreference and fetchCitationSummary when switch is toggled to true', () => {
    const namespace = LITERATURE_NS;
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <CitationSummarySwitchContainer namespace={namespace} />
      </Provider>
    );
    const onSwitchChange = wrapper.find(CitationSummarySwitch).prop('onChange');
    onSwitchChange(true);

    const expectedActions = [
      setPreference(CITATION_SUMMARY_ENABLING_PREFERENCE, true),
      fetchCitationSummary(namespace),
    ];
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(store.getActions()).toEqual(expectedActions);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('removes citation summary param when switch is toggled to false', () => {
    const namespace = AUTHOR_PUBLICATIONS_NS;
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <CitationSummarySwitchContainer namespace={namespace} />
      </Provider>
    );
    const onSwitchChange = wrapper.find(CitationSummarySwitch).prop('onChange');
    onSwitchChange(false);

    const expectedActions = [
      setPreference(CITATION_SUMMARY_ENABLING_PREFERENCE, false),
      appendQueryToLocationSearch({ [UI_CITATION_SUMMARY_PARAM]: undefined }),
    ];
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(store.getActions()).toEqual(expectedActions);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('sets checked if citation summary param is set', () => {
    const namespace = AUTHOR_PUBLICATIONS_NS;
    const store = getStoreWithState({
      router: {
        location: {
          search: `?${UI_CITATION_SUMMARY_PARAM}=true`,
          query: { [UI_CITATION_SUMMARY_PARAM]: true },
        },
      },
    });

    const wrapper = mount(
      <Provider store={store}>
        <CitationSummarySwitchContainer namespace={namespace} />
      </Provider>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(CitationSummarySwitch)).toHaveProp({
      checked: true,
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('sets unchecked if hash is not set', () => {
    const namespace = AUTHOR_PUBLICATIONS_NS;
    const store = getStoreWithState({
      location: {
        search: '?another-thing=5',
        query: { 'another-thing': 5 },
      },
    });

    const wrapper = mount(
      <Provider store={store}>
        <CitationSummarySwitchContainer namespace={namespace} />
      </Provider>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(CitationSummarySwitch)).toHaveProp({
      checked: false,
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('sets citationSummaryEnablingPreference from state', () => {
    const namespace = AUTHOR_PUBLICATIONS_NS;
    const store = getStoreWithState({
      user: fromJS({
        preferences: { [CITATION_SUMMARY_ENABLING_PREFERENCE]: true },
      }),
    });

    const wrapper = mount(
      <Provider store={store}>
        <CitationSummarySwitchContainer namespace={namespace} />
      </Provider>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(CitationSummarySwitch)).toHaveProp({
      citationSummaryEnablingPreference: true,
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('dispatches appendQueryToLocationSearch onCitationSummaryUserPreferenceChange if the citation summary is enabled', () => {
    const namespace = AUTHOR_PUBLICATIONS_NS;
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <CitationSummarySwitchContainer namespace={namespace} />
      </Provider>
    );
    const onCitationSummaryUserPreferenceChange = wrapper
      .find(CitationSummarySwitch)
      .prop('onCitationSummaryUserPreferenceChange');
    onCitationSummaryUserPreferenceChange(true);

    const expectedActions = [
      appendQueryToLocationSearch({ [UI_CITATION_SUMMARY_PARAM]: true }),
    ];
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(store.getActions()).toEqual(expectedActions);
  });
});
