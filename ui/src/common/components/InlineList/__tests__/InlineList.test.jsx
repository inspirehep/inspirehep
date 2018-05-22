import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import InlineList from '../InlineList';

describe('InlineList', () => {
  it('renders with minimal props set', () => {
    const items = fromJS(['foo', 'bar']);
    const wrapper = shallow((
      <InlineList
        items={items}
        renderItem={item => <span>{item}</span>}
      />
    ));
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with all props set', () => {
    const items = fromJS([
      { id: 1, value: 'foo' },
      { id: 2, value: 'bar' },
    ]);
    const wrapper = shallow((
      <InlineList
        label="Test"
        suffix={<span>Suffix</span>}
        items={items}
        extractKey={item => item.get('id')}
        renderItem={item => <span>{item.get('value')}</span>}
      />
    ));
    expect(wrapper).toMatchSnapshot();
  });

  it('does not render if items are null', () => {
    const wrapper = shallow((
      <InlineList
        label="Test"
        suffix={<span>Suffix</span>}
        items={null}
        renderItem={item => <span>{item}</span>}
      />
    ));
    expect(wrapper).toMatchSnapshot();
  });
});
