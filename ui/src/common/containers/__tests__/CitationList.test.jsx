import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import CitationList, { PAGE_SIZE } from '../CitationList';
import { getStoreWithState, getStore } from '../../../fixtures/store';
import fetchCitations from '../../../actions/citations';

jest.mock('../../../actions/citations');

describe('CitationList', () => {
  beforeAll(() => {
    fetchCitations.mockReturnValue(async () => {});
  });

  it('renders with state from store', () => {
    const store = getStoreWithState({
      citations: fromJS({
        loading: false,
        data: [
          {
            control_number: 170,
          },
        ],
        total: 1,
      }),
    });
    const wrapper = shallow(
      <CitationList pidType="test" recordId={123} store={store} />
    ).dive();
    expect(wrapper).toMatchSnapshot();
  });

  it('calls fetchCitations on mount for first page', () => {
    const store = getStore();
    shallow(<CitationList pidType="test" recordId={123} store={store} />);
    expect(fetchCitations).toHaveBeenCalledWith('test', 123, {
      page: 1,
      pageSize: PAGE_SIZE,
    });
  });

  it('calls fetchCitations on page change', () => {
    const store = getStore();
    const wrapper = shallow(
      <CitationList pidType="test" recordId={123} store={store} />
    ).dive();
    const page = 2;
    wrapper.instance().onPageChange(page);
    expect(fetchCitations).toHaveBeenCalledWith('test', 123, {
      page,
      pageSize: PAGE_SIZE,
    });
  });

  it('does not render if total <= 0', () => {
    const store = getStoreWithState({
      citations: fromJS({
        loading: false,
        data: [
          {
            control_number: 170,
          },
        ],
        total: 0,
      }),
    });
    const wrapper = shallow(
      <CitationList store={store} pidType="test" recordId={123} />
    ).dive();
    expect(wrapper).toMatchSnapshot();
  });
});
