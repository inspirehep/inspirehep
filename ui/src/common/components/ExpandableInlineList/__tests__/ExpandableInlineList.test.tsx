import React from 'react';
import { fromJS } from 'immutable';
import { shallow } from 'enzyme';

import ExpandableInlineList from '../ExpandableInlineList';
import ExpandListToggle from '../../ExpandListToggle';


describe('ExpandableInlineList', () => {
  
  it('renders only 10 by default with expand toggle', () => {
    const items = fromJS([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ items: any; renderItem: (item: any) => any... Remove this comment to see the full error message
      <ExpandableInlineList items={items} renderItem={(item: any) => item} />
    );
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('renders only limited amount with expand toggle', () => {
    const items = fromJS([1, 2, 3, 4, 5]);
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ limit: number; items: any; renderItem: (it... Remove this comment to see the full error message
      <ExpandableInlineList limit={3} items={items} renderItem={(item: any) => item} />
    );
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('renders all on expand toggle', () => {
    const items = fromJS([1, 2, 3, 4, 5]);
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ limit: number; items: any; renderItem: (it... Remove this comment to see the full error message
      <ExpandableInlineList limit={3} items={items} renderItem={(item: any) => item} />
    );
    const onExpandToggle = wrapper.find(ExpandListToggle).prop('onToggle');
    // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
    onExpandToggle();
    wrapper.update();
    
    expect(wrapper).toMatchSnapshot();
  });
});
