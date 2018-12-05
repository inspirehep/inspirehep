import React from 'react';
import { shallow } from 'enzyme';

import ExpandListToggle from '../ExpandListToggle';
import SecondaryButton from '../SecondaryButton';

describe('ExpandListToggle', () => {
  it('renders toggle size > limit', () => {
    const wrapper = shallow(
      <ExpandListToggle
        size={10}
        limit={5}
        onToggle={jest.fn()}
        expanded={false}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('does not render toggle size == limit', () => {
    const wrapper = shallow(
      <ExpandListToggle
        size={5}
        limit={5}
        onToggle={jest.fn()}
        expanded={false}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('does not render toggle size < limit', () => {
    const wrapper = shallow(
      <ExpandListToggle
        size={3}
        limit={5}
        onToggle={jest.fn()}
        expanded={false}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders toggle with expanded true', () => {
    const wrapper = shallow(
      <ExpandListToggle size={10} limit={5} onToggle={jest.fn()} expanded />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls onToggle when button is clicked', () => {
    const onToggle = jest.fn();
    const wrapper = shallow(
      <ExpandListToggle size={10} limit={5} onToggle={onToggle} expanded />
    );
    wrapper.find(SecondaryButton).simulate('click');
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
