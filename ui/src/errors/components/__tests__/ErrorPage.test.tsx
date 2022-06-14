import React from 'react';
import { shallow } from 'enzyme';
import ErrorPage from '../ErrorPage';

describe('ErrorPage', () => {
  it('renders with all props', () => {
    const wrapper = shallow(
      <ErrorPage
        message="Error !"
        detail={<span>Detail about the error</span>}
        imageSrc="image_src"
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with default detail', () => {
    const wrapper = shallow(
      <ErrorPage message="Error !" imageSrc="image_src" />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
