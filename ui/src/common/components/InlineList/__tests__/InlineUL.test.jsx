import React from 'react';
import { shallow } from 'enzyme';
import InlineUL from '../InlineUL';

describe('InlineUL', () => {
  it('renders children seperated by default', () => {
    const wrapper = shallow(
      <InlineUL>
        <div>First div</div>
        <div>Second div</div>
      </InlineUL>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders children with class', () => {
    const wrapper = shallow(
      <InlineUL wrapperClassName="di">
        <div>First div</div>
        <div>Second div</div>
      </InlineUL>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with separateItemsClassName passed', () => {
    const wrapper = shallow(
      <InlineUL separateItemsClassName="separate-items-with-middledot">
        <div>First div</div>
        <div>Second div</div>
      </InlineUL>
    );
    expect(wrapper).toMatchSnapshot();
  });
});
