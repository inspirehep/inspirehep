import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import CitationList, { PAGE_SIZE } from '../CitationList';
import ListWithPagination from '../ListWithPagination';

describe('CitationList', () => {
  it('renders', () => {
    const wrapper = shallow(
      <CitationList
        loading={false}
        error={null}
        citations={fromJS([{ control_number: 170 }])}
        total={1}
        onPageDisplay={jest.fn()}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls onPageDisplay for the first page on mount', () => {
    const onPageDisplay = jest.fn();
    shallow(
      <CitationList
        loading={false}
        error={null}
        citations={fromJS([])}
        total={0}
        onPageDisplay={onPageDisplay}
      />
    );
    expect(onPageDisplay).toHaveBeenCalledWith({
      page: 1,
      pageSize: PAGE_SIZE,
    });
  });

  it('calls onPageDisplay and sets page state on list page change', () => {
    const onPageDisplay = jest.fn();
    const wrapper = shallow(
      <CitationList
        loading={false}
        error={null}
        citations={fromJS([{ control_number: 170 }])}
        total={50}
        onPageDisplay={onPageDisplay}
      />
    );
    const page = 2;
    const onListPageChange = wrapper
      .find(ListWithPagination)
      .prop('onPageChange');
    onListPageChange(page);
    expect(onPageDisplay).toHaveBeenCalledWith({
      page,
      pageSize: PAGE_SIZE,
    });
    expect(wrapper.state('page')).toEqual(page);
  });

  it('does not render the list if total 0', () => {
    const wrapper = shallow(
      <CitationList
        loading={false}
        error={null}
        citations={fromJS([{ control_number: 170 }])}
        total={0}
        onPageDisplay={jest.fn()}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with error', () => {
    const wrapper = shallow(
      <CitationList
        loading={false}
        error={fromJS({ message: 'error' })}
        citations={fromJS([])}
        total={0}
        onPageDisplay={jest.fn()}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
