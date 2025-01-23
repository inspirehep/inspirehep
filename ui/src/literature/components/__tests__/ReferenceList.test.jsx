import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import ReferenceList from '../ReferenceList';
import ListWithPagination from '../../../common/components/ListWithPagination';

describe('ReferenceList', () => {
  it('renders with references', () => {
    const references = fromJS([
      {
        titles: [{ title: 'Reference 1' }],
      },
      {
        titles: [{ title: 'Reference 2' }],
      },
    ]);
    const wrapper = shallow(
      <ReferenceList
        loading={false}
        error={null}
        references={references}
        total={1}
        onPageChange={() => {}}
        onSizeChange={() => {}}
        query={{ size: 25, page: 1 }}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders items with (page * index) key if title is absent', () => {
    const references = fromJS([
      {
        publication_info: [{ journal_title: 'Journal 1' }],
      },
      {
        authors: [{ full_name: 'Author 2' }],
      },
    ]);
    const wrapper = shallow(
      <ReferenceList
        loading={false}
        error={null}
        references={references}
        total={1}
        onPageChange={() => {}}
        onSizeChange={() => {}}
        query={{ size: 25, page: 1 }}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls onQueryChange and sets the correct page', () => {
    const onPageChange = jest.fn();
    const wrapper = shallow(
      <ReferenceList
        loading={false}
        error={null}
        references={fromJS([{ titles: [{ title: 'Reference 1' }] }])}
        total={50}
        onPageChange={onPageChange}
        query={{ size: 25, page: 1 }}
      />
    );
    const page = 2;
    const size = 25;
    const onListPageChange = wrapper
      .find(ListWithPagination)
      .prop('onPageChange');
    onListPageChange(page, size);
    expect(onPageChange).toHaveBeenCalledWith(page, size);
  });

  it('does not render the list if total 0', () => {
    const wrapper = shallow(
      <ReferenceList
        loading={false}
        error={null}
        references={fromJS([{ titles: [{ title: 'Reference 1' }] }])}
        total={0}
        onPageChange={() => {}}
        query={{ size: 25, page: 1 }}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with error', () => {
    const wrapper = shallow(
      <ReferenceList
        loading={false}
        error={fromJS({ message: 'error' })}
        references={fromJS([])}
        total={0}
        onPageChange={() => {}}
        query={{ size: 25, page: 1 }}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});

it('calls onQueryChange and sets display to 50 references/page', () => {
  const onSizeChange = jest.fn();
  const wrapper = shallow(
    <ReferenceList
      loading={false}
      error={null}
      references={fromJS([{ titles: [{ title: 'Reference 1' }] }])}
      total={50}
      onPageChange={() => {}}
      onSizeChange={onSizeChange}
      query={{ size: 50 }}
    />
  );
  const page = '1';
  const size = 50;
  const onListPageSizeChange = wrapper
    .find(ListWithPagination)
    .prop('onSizeChange');
  onListPageSizeChange(page, size);
  expect(onSizeChange).toHaveBeenCalledWith(page, size);
});
