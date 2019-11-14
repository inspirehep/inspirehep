import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import CitationList from '../CitationList';
import ListWithPagination from '../ListWithPagination';

describe('CitationList', () => {
  it('renders with citations', () => {
    const citations = fromJS([
      {
        control_number: 170,
      },
      {
        control_number: 171,
      },
    ]);
    const wrapper = shallow(
      <CitationList
        loading={false}
        error={null}
        citations={citations}
        total={1}
        onQueryChange={jest.fn()}
        query={{ size: 25, page: 1 }}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls onQueryChange and sets the correct page', () => {
    const onQueryChange = jest.fn();
    const wrapper = shallow(
      <CitationList
        loading={false}
        error={null}
        citations={fromJS([{ control_number: 170 }])}
        total={50}
        onQueryChange={onQueryChange}
        query={{ size: 25, page: 1 }}
      />
    );
    const page = 2;
    const onListPageChange = wrapper
      .find(ListWithPagination)
      .prop('onPageChange');
    onListPageChange(page);
    expect(onQueryChange).toHaveBeenCalledWith({
      page,
    });
  });

  it('does not render the list if total 0', () => {
    const wrapper = shallow(
      <CitationList
        loading={false}
        error={null}
        citations={fromJS([{ control_number: 170 }])}
        total={0}
        onQueryChange={jest.fn()}
        query={{ size: 25, page: 1 }}
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
        onQueryChange={jest.fn()}
        query={{ size: 25, page: 1 }}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
