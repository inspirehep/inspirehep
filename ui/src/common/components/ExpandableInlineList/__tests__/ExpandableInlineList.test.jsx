import React from 'react';
import { fromJS } from 'immutable';
import { shallow } from 'enzyme';

import ExpandableInlineList from '../ExpandableInlineList';
import ExpandListToggle from '../../ExpandListToggle';

describe('ExpandableInlineList', () => {
  it('renders only 10 by default with expand toggle', () => {
    const items = fromJS([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    const wrapper = shallow(
      <ExpandableInlineList items={items} renderItem={item => item} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders only limited amount with expand toggle', () => {
    const items = fromJS([1, 2, 3, 4, 5]);
    const wrapper = shallow(
      <ExpandableInlineList limit={3} items={items} renderItem={item => item} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders all on expand toggle', () => {
    const items = fromJS([1, 2, 3, 4, 5]);
    const wrapper = shallow(
      <ExpandableInlineList limit={3} items={items} renderItem={item => item} />
    );
    const onExpandToggle = wrapper.find(ExpandListToggle).prop('onToggle');
    onExpandToggle();
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });
});
