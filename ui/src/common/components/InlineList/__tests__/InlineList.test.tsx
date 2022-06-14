import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import InlineList from '../InlineList';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('InlineList', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders items seperated by default', () => {
    const items = fromJS(['foo', 'bar']);
    const wrapper = shallow(
      <InlineList items={items} renderItem={(item: $TSFixMe) => <span>{item}</span>} />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders item without separator', () => {
    const items = fromJS(['foo', 'bar']);
    const wrapper = shallow(
      <InlineList
        separateItems={false}
        items={items}
        renderItem={(item: $TSFixMe) => <span>{item}</span>}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders wrapper with class', () => {
    const items = fromJS(['foo', 'bar']);
    const wrapper = shallow(
      <InlineList
        wrapperClassName="di"
        items={items}
        renderItem={(item: $TSFixMe) => <span>{item}</span>}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders items (array) without separator', () => {
    const items = ['foo', 'bar'];
    const wrapper = shallow(
      <InlineList
        separateItems={false}
        items={items}
        renderItem={(item: $TSFixMe) => <span>{item}</span>}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with all props set', () => {
    const items = fromJS([{ id: 1, value: 'foo' }, { id: 2, value: 'bar' }]);
    const wrapper = shallow(
      <InlineList
        label="Test"
        suffix={<span>Suffix</span>}
        items={items}
        extractKey={(item: $TSFixMe) => item.get('id')}
        renderItem={(item: $TSFixMe) => <span>{item.get('value')}</span>}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with all props set (array)', () => {
    const items = [{ id: 1, value: 'foo' }, { id: 2, value: 'bar' }];
    const wrapper = shallow(
      <InlineList
        label="Test"
        suffix={<span>Suffix</span>}
        items={items}
        extractKey={(item: $TSFixMe) => item.id}
        renderItem={(item: $TSFixMe) => <span>{item.value}</span>}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('does not render if items are null', () => {
    const wrapper = shallow(
      <InlineList
        label="Test"
        suffix={<span>Suffix</span>}
        items={null}
        renderItem={(item: $TSFixMe) => <span>{item}</span>}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('does not render if empty array passed', () => {
    const wrapper = shallow(
      <InlineList
        label="Test"
        suffix={<span>Suffix</span>}
        items={[]}
        renderItem={(item: $TSFixMe) => <span>{item}</span>}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('does not render if empty list passed', () => {
    const wrapper = shallow(
      <InlineList
        label="Test"
        suffix={<span>Suffix</span>}
        items={fromJS([])}
        renderItem={(item: $TSFixMe) => <span>{item}</span>}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
