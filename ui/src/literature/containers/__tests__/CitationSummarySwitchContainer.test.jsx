import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';

import { getStore, getStoreWithState } from '../../../fixtures/store';
import CitationSummarySwitchContainer from '../CitationSummarySwitchContainer';
import CitationSummarySwitch from '../../components/CitationSummarySwitch';
import { setHash } from '../../../actions/router';
import { WITH_CITATION_SUMMARY } from '../../constants';
import { USER_SET_PREFERENCE } from '../../../actions/actionTypes';
import { CITATION_SUMMARY_ENABLING_PREFERENCE } from '../../../reducers/user';

jest.mock('../../../actions/router');

describe('CitationSummarySwitchContainer', () => {
  it('dispatches setPreference when switch is toggled', () => {
    setHash.mockImplementation(() => jest.fn());
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <CitationSummarySwitchContainer />
      </Provider>
    );
    const onSwitchChange = wrapper.find(CitationSummarySwitch).prop('onChange');
    onSwitchChange(true);
    const expectedActions = [
      {
        type: USER_SET_PREFERENCE,
        payload: { name: CITATION_SUMMARY_ENABLING_PREFERENCE, value: true },
      },
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('removes hash when switch is toggled to false', () => {
    setHash.mockImplementation(() => jest.fn());
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <CitationSummarySwitchContainer />
      </Provider>
    );
    const onSwitchChange = wrapper.find(CitationSummarySwitch).prop('onChange');
    onSwitchChange(false);
    expect(setHash).toHaveBeenCalledWith('');
  });

  it('set checked if hash is set', () => {
    const store = getStoreWithState({
      router: {
        location: { hash: WITH_CITATION_SUMMARY },
      },
    });

    const wrapper = mount(
      <Provider store={store}>
        <CitationSummarySwitchContainer />
      </Provider>
    );
    expect(wrapper.find(CitationSummarySwitch)).toHaveProp({
      checked: true,
    });
  });

  it('set unchecked if hash is not set', () => {
    const store = getStoreWithState({
      router: {
        location: { hash: '' },
      },
    });

    const wrapper = mount(
      <Provider store={store}>
        <CitationSummarySwitchContainer />
      </Provider>
    );
    expect(wrapper.find(CitationSummarySwitch)).toHaveProp({
      checked: false,
    });
  });

  it('set citationSummaryEnablingPreference from state', () => {
    const store = getStoreWithState({
      user: fromJS({
        preferences: { [CITATION_SUMMARY_ENABLING_PREFERENCE]: true },
      }),
    });

    const wrapper = mount(
      <Provider store={store}>
        <CitationSummarySwitchContainer />
      </Provider>
    );
    expect(wrapper.find(CitationSummarySwitch)).toHaveProp({
      citationSummaryEnablingPreference: true,
    });
  });

  it('calls setHash when onCitationSummaryUserPreferenceChange if the citation summary is enabled', () => {
    setHash.mockImplementation(() => jest.fn());
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <CitationSummarySwitchContainer />
      </Provider>
    );
    const onCitationSummaryUserPreferenceChange = wrapper
      .find(CitationSummarySwitch)
      .prop('onCitationSummaryUserPreferenceChange');
    onCitationSummaryUserPreferenceChange(true);
    expect(setHash).toHaveBeenCalledWith(WITH_CITATION_SUMMARY);
  });
});
