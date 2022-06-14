import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import ReferenceList from '../ReferenceList';
import ListWithPagination from '../../../common/components/ListWithPagination';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('ReferenceList', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onQueryChange={jest.fn()}
        query={{ size: 25, page: 1 }}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onQueryChange={jest.fn()}
        query={{ size: 25, page: 1 }}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('calls onQueryChange and sets the correct page', () => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onQueryChange = jest.fn();
    const wrapper = shallow(
      <ReferenceList
        loading={false}
        error={null}
        references={fromJS([{ titles: [{ title: 'Reference 1' }] }])}
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(onQueryChange).toHaveBeenCalledWith({
      page,
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('does not render the list if total 0', () => {
    const wrapper = shallow(
      <ReferenceList
        loading={false}
        error={null}
        references={fromJS([{ titles: [{ title: 'Reference 1' }] }])}
        total={0}
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onQueryChange={jest.fn()}
        query={{ size: 25, page: 1 }}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with error', () => {
    const wrapper = shallow(
      <ReferenceList
        loading={false}
        error={fromJS({ message: 'error' })}
        references={fromJS([])}
        total={0}
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onQueryChange={jest.fn()}
        query={{ size: 25, page: 1 }}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
it('calls onQueryChange and sets display to 50 references/page', () => {
  // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
  const onQueryChange = jest.fn();
  const wrapper = shallow(
    <ReferenceList
      loading={false}
      error={null}
      references={fromJS([{ titles: [{ title: 'Reference 1' }] }])}
      total={50}
      onQueryChange={onQueryChange}
      query={{ size: 50 }}
    />
  );
  const page = '1';
  const size = 50;
  const onListPageSizeChange = wrapper
    .find(ListWithPagination)
    .prop('onSizeChange');
  // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
  onListPageSizeChange(page, size);
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
  expect(onQueryChange).toHaveBeenCalledWith({
    page,
    size,
  });
});
