import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';

import { getStoreWithState, mockActionCreator } from '../../../fixtures/store';
import CitationSummaryBoxContainer from '../CitationSummaryBoxContainer';
import CitationSummaryBox from '../../components/CitationSummaryBox';
import { LITERATURE_NS } from '../../../search/constants';

import { fetchCitationSummary } from '../../../actions/citations';
import { changeExcludeSelfCitations } from '../../../actions/ui';

jest.mock('../../../actions/citations');
mockActionCreator(fetchCitationSummary);

describe('CitationSummaryBoxContainer', () => {
  it('passes excludeSelfCitations from state to CitationSummaryBox', () => {
    const excludeSelfCitations = true;
    const store = getStoreWithState({
      ui: fromJS({
        excludeSelfCitations,
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <CitationSummaryBoxContainer namespace={LITERATURE_NS} />
      </Provider>
    );
    expect(wrapper.find(CitationSummaryBox)).toHaveProp({
      excludeSelfCitations,
    });
  });

  it('dispatches changeExcludeSelfCitations and fetchCitationSummary on exclude self citations changed', () => {
    const initialExcludeSS = false;
    const namespace = LITERATURE_NS;
    const store = getStoreWithState({
      ui: fromJS({
        excludeSelfCitations: initialExcludeSS,
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <CitationSummaryBoxContainer namespace={namespace} />
      </Provider>
    );

    const newExcludeSS = true;
    const onExcludeSelfCitationsChange = wrapper
      .find(CitationSummaryBox)
      .prop('onExcludeSelfCitationsChange');
    onExcludeSelfCitationsChange(newExcludeSS);

    const expectedActions = [
      changeExcludeSelfCitations(newExcludeSS),
      fetchCitationSummary(namespace),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
