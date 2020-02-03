import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';

import { getStore, getStoreWithState } from '../../../fixtures/store';
import CitationSummarySwitchContainer, { WITH_CITATION_SUMMARY } from '../CitationSummarySwitchContainer';
import CitationSummarySwitch from '../../components/CitationSummarySwitch';
import { setHash } from '../../../actions/router';

jest.mock('../../../actions/router');


describe('CitationSummarySwitchContainer', () => {
  it('sets with-citation-summary hash to url when switch is enabled', () => {
    setHash.mockImplementation(() => jest.fn());
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <CitationSummarySwitchContainer />
      </Provider>
    );
    const onSwitchChange = wrapper.find(CitationSummarySwitch).prop('onChange');
    onSwitchChange(true);

    expect(setHash).toHaveBeenCalledWith(WITH_CITATION_SUMMARY)
  });

  it('set checked if hash is set', () => {
    const store = getStoreWithState({
      router: {
        location: { hash: WITH_CITATION_SUMMARY }
      }
    });

    const wrapper = mount(
      <Provider store={store}>
        <CitationSummarySwitchContainer />
      </Provider>
    );
    expect(wrapper.find(CitationSummarySwitch)).toHaveProp({
      checked: true
    });
  });

  it('set unchecked if hash is not set', () => {
    const store = getStoreWithState({
      router: {
        location: { hash: '' }
      }
    });

    const wrapper = mount(
      <Provider store={store}>
        <CitationSummarySwitchContainer />
      </Provider>
    );
    expect(wrapper.find(CitationSummarySwitch)).toHaveProp({
      checked: false
    });
  });
});
