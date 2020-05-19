import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';

import {
  getStore,
  getStoreWithState,
  mockActionCreator,
} from '../../../fixtures/store';
import CitationSummarySwitchContainer from '../CitationSummarySwitchContainer';
import CitationSummarySwitch from '../../components/CitationSummarySwitch';
import { setHash } from '../../../actions/router';
import { WITH_CITATION_SUMMARY } from '../../constants';
import { CITATION_SUMMARY_ENABLING_PREFERENCE } from '../../../reducers/user';
import {
  LITERATURE_NS,
  AUTHOR_PUBLICATIONS_NS,
} from '../../../search/constants';
import { setPreference } from '../../../actions/user';
import { fetchCitationSummary } from '../../../actions/citations';

jest.mock('../../../actions/router');
mockActionCreator(setHash);

jest.mock('../../../actions/citations');
mockActionCreator(fetchCitationSummary);

describe('CitationSummarySwitchContainer', () => {
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
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('removes hash when switch is toggled to false', () => {
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
      setHash(''),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('sets checked if hash is set', () => {
    const namespace = AUTHOR_PUBLICATIONS_NS;
    const store = getStoreWithState({
      router: {
        location: { hash: WITH_CITATION_SUMMARY },
      },
    });

    const wrapper = mount(
      <Provider store={store}>
        <CitationSummarySwitchContainer namespace={namespace} />
      </Provider>
    );
    expect(wrapper.find(CitationSummarySwitch)).toHaveProp({
      checked: true,
    });
  });

  it('sets unchecked if hash is not set', () => {
    const namespace = AUTHOR_PUBLICATIONS_NS;
    const store = getStoreWithState({
      router: {
        location: { hash: '' },
      },
    });

    const wrapper = mount(
      <Provider store={store}>
        <CitationSummarySwitchContainer namespace={namespace} />
      </Provider>
    );
    expect(wrapper.find(CitationSummarySwitch)).toHaveProp({
      checked: false,
    });
  });

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
    expect(wrapper.find(CitationSummarySwitch)).toHaveProp({
      citationSummaryEnablingPreference: true,
    });
  });

  it('dispatches setHash onCitationSummaryUserPreferenceChange if the citation summary is enabled', () => {
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

    const expectedActions = [setHash(WITH_CITATION_SUMMARY)];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
