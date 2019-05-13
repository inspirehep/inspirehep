import React from 'react';
import { shallow, mount } from 'enzyme';
import { fromJS } from 'immutable';

import { getStoreWithState, getStore } from '../../../fixtures/store';
import { fetchCitationSummary } from '../../../actions/citations';
import CitationSummaryTableContainer from '../CitationSummaryTableContainer';

jest.mock('../../../actions/citations');

describe('CitationSummaryTableContainer', () => {
  beforeAll(() => {
    fetchCitationSummary.mockReturnValue(async () => {});
  });

  afterEach(() => {
    fetchCitationSummary.mockClear();
  });

  it('renders with state from store', () => {
    const store = getStoreWithState({
      citations: fromJS({
        loadingCitationSummary: false,
        citationSummary: {
          control_number: 170,
        },
      }),
    });
    const wrapper = shallow(
      <CitationSummaryTableContainer
        searchQuery={fromJS({ author: 'BAI_Ben' })}
        store={store}
      />
    ).dive();
    expect(wrapper).toMatchSnapshot();
  });

  it('calls fetchCitationSummary on mount', () => {
    const store = getStore();
    mount(
      <CitationSummaryTableContainer
        searchQuery={fromJS({ author: 'BAI_Ben' })}
        store={store}
      />
    );
    expect(fetchCitationSummary).toHaveBeenCalledWith(
      fromJS({ author: 'BAI_Ben' })
    );
  });

  it('renders with error', () => {
    const store = getStoreWithState({
      citations: fromJS({
        loadingCitationSummary: false,
        citationSummary: {},
        errorCitationSummary: { message: 'Error' },
      }),
    });
    const wrapper = shallow(
      <CitationSummaryTableContainer
        searchQuery={fromJS({ author: 'BAI_Ben' })}
        store={store}
      />
    ).dive();
    expect(wrapper).toMatchSnapshot();
  });

  it('calls fetchCitationSummary for new props if searchQuery is changed', () => {
    const store = getStore();
    const wrapper = shallow(
      <CitationSummaryTableContainer
        searchQuery={fromJS({ author: 'BAI_Ben' })}
        store={store}
      />
    ).dive();
    wrapper.update();
    wrapper.setProps({ searchQuery: fromJS({ author: 'BAI_Ana' }) });
    expect(fetchCitationSummary).toHaveBeenCalledWith(
      fromJS({ author: 'BAI_Ana' })
    );
    wrapper.update();
  });

  it('does not call fetchCitationSummary if component update but searchQuery is same', () => {
    const store = getStore();
    const wrapper = mount(
      <CitationSummaryTableContainer
        searchQuery={fromJS({ author: 'BAI_Ben' })}
        store={store}
      />
    );
    wrapper.update();
    wrapper.setProps(fromJS({ author: 'BAI_Ben' }));
    wrapper.update();
    expect(fetchCitationSummary).toHaveBeenCalledWith(
      fromJS({ author: 'BAI_Ben' })
    );
    expect(fetchCitationSummary).toHaveBeenCalledTimes(1);
  });
});
