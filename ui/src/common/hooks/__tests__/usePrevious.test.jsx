import React from 'react';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import usePrevious from '../usePrevious';

// eslint-disable-next-line react/prop-types
function TestPrevious({ value }) {
  const previousValue = usePrevious(value);
  return (
    <span>
      Previous: {previousValue}, Current: {value}
    </span>
  );
}

describe('usePrevious', () => {
  it('renders previous and current value', () => {
    const wrapper = mount(<TestPrevious value={1} />);
    act(() => {
      wrapper.setProps({ value: 2 });
      wrapper.update();
    });
    expect(wrapper).toMatchSnapshot();
  });
});
