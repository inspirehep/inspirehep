import React from 'react';
import { shallow } from 'enzyme';
import { InlineUL } from '..';
import { SEPARATOR_MIDDLEDOT } from '../constants';

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

  it('renders with separator passed', () => {
    const wrapper = shallow(
      <InlineUL separator={SEPARATOR_MIDDLEDOT}>
        <div>First div</div>
        <div>Second div</div>
      </InlineUL>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('does not render null children', () => {
    const wrapper = shallow(
      <InlineUL>
        <div>First div</div>
        {null}
        <div>Third div</div>
        {null}
      </InlineUL>
    );
    expect(wrapper).toMatchSnapshot();
  });
});
