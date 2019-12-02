import React from 'react';
import { act } from 'react-dom/test-utils';
import { shallow, mount } from 'enzyme';
import SubmitButton from '../SubmitButton';

describe('SubmitButton', () => {
  it('renders with all props set', () => {
    const wrapper = shallow(
      <SubmitButton isValid isSubmitting={false} isValidating={false} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with loading', () => {
    const wrapper = shallow(
      <SubmitButton isValid isSubmitting isValidating={false} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls scrollTo when form is submitted and is not valid', () => {
    const wrapper = mount(
      <SubmitButton isValid={false} isSubmitting isValidating={false} />
    );
    global.scrollTo = jest.fn();
    act(() => {
      wrapper.setProps({ isSubmitting: false });
      wrapper.update();
    });
    expect(global.scrollTo).toHaveBeenCalled();
  });
});
