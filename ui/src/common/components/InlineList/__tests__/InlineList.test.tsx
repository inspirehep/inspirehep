import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import InlineList from '../InlineList';


describe('InlineList', () => {
  
  it('renders items seperated by default', () => {
    const items = fromJS(['foo', 'bar']);
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <InlineList items={items} renderItem={(item: any) => <span>{item}</span>} />
    );
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('renders item without separator', () => {
    const items = fromJS(['foo', 'bar']);
    const wrapper = shallow(
      <InlineList
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        separateItems={false}
        items={items}
        renderItem={(item: any) => <span>{item}</span>}
      />
    );
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('renders wrapper with class', () => {
    const items = fromJS(['foo', 'bar']);
    const wrapper = shallow(
      <InlineList
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        wrapperClassName="di"
        items={items}
        renderItem={(item: any) => <span>{item}</span>}
      />
    );
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('renders items (array) without separator', () => {
    const items = ['foo', 'bar'];
    const wrapper = shallow(
      <InlineList
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        separateItems={false}
        items={items}
        renderItem={(item: any) => <span>{item}</span>}
      />
    );
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('renders with all props set', () => {
    const items = fromJS([{ id: 1, value: 'foo' }, { id: 2, value: 'bar' }]);
    const wrapper = shallow(
      <InlineList
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        label="Test"
        suffix={<span>Suffix</span>}
        items={items}
        extractKey={(item: any) => item.get('id')}
        renderItem={(item: any) => <span>{item.get('value')}</span>}
      />
    );
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('renders with all props set (array)', () => {
    const items = [{ id: 1, value: 'foo' }, { id: 2, value: 'bar' }];
    const wrapper = shallow(
      <InlineList
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        label="Test"
        suffix={<span>Suffix</span>}
        items={items}
        extractKey={(item: any) => item.id}
        renderItem={(item: any) => <span>{item.value}</span>}
      />
    );
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('does not render if items are null', () => {
    const wrapper = shallow(
      <InlineList
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        label="Test"
        suffix={<span>Suffix</span>}
        items={null}
        renderItem={(item: any) => <span>{item}</span>}
      />
    );
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('does not render if empty array passed', () => {
    const wrapper = shallow(
      <InlineList
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        label="Test"
        suffix={<span>Suffix</span>}
        items={[]}
        renderItem={(item: any) => <span>{item}</span>}
      />
    );
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('does not render if empty list passed', () => {
    const wrapper = shallow(
      <InlineList
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        label="Test"
        suffix={<span>Suffix</span>}
        items={fromJS([])}
        renderItem={(item: any) => <span>{item}</span>}
      />
    );
    
    expect(wrapper).toMatchSnapshot();
  });
});
