import React from 'react';
import { shallow, mount } from 'enzyme';
import { fromJS } from 'immutable';

import CitationListContainer, { PAGE_SIZE } from '../CitationListContainer';
import { getStoreWithState, getStore } from '../../../fixtures/store';
import fetchCitations from '../../../actions/citations';

jest.mock('../../../actions/citations');

describe('CitationListContainer', () => {
  beforeAll(() => {
    fetchCitations.mockReturnValue(async () => {});
  });

  afterEach(() => {
    fetchCitations.mockClear();
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
      <CitationListContainer pidType="test" recordId={123} store={store} />
    ).dive();
    expect(wrapper).toMatchSnapshot();
  });

  it('calls fetchCitations on mount for first page', () => {
    const store = getStore();
    mount(
      <CitationListContainer pidType="test" recordId={123} store={store} />
    );
    expect(fetchCitations).toHaveBeenCalledWith('test', 123, {
      page: 1,
      pageSize: PAGE_SIZE,
    });
  });

  it('calls fetchCitations for new record if recordId is changed', () => {
    const store = getStore();
    const wrapper = mount(
      <CitationListContainer pidType="test" recordId={123} store={store} />
    );
    wrapper.setProps({ recordId: 321 });
    expect(fetchCitations).toHaveBeenCalledWith('test', 321, {
      page: 1,
      pageSize: PAGE_SIZE,
    });
  });

  it('does not call fetchCitations if component update but recordId is same', () => {
    const store = getStore();
    const wrapper = mount(
      <CitationListContainer pidType="test" recordId={123} store={store} />
    );
    wrapper.setProps({ recordId: 123 });
    expect(fetchCitations).toHaveBeenCalledWith('test', 123, {
      page: 1,
      pageSize: PAGE_SIZE,
    });
    expect(fetchCitations).toHaveBeenCalledTimes(1);
  });

  it('calls fetchCitations and sets page state on page change', () => {
    const store = getStore();
    const wrapper = shallow(
      <CitationListContainer pidType="test" recordId={123} store={store} />
    ).dive();
    const page = 2;
    wrapper.instance().onPageChange(page);
    expect(fetchCitations).toHaveBeenCalledWith('test', 123, {
      page,
      pageSize: PAGE_SIZE,
    });
    expect(wrapper.state('page')).toEqual(page);
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
      <CitationListContainer store={store} pidType="test" recordId={123} />
    ).dive();
    expect(wrapper).toMatchSnapshot();
  });
});
