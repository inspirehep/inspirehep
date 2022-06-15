import React from 'react';
import { shallow } from 'enzyme';
import ErrorPage from '../ErrorPage';


describe('ErrorPage', () => {
  
  it('renders with all props', () => {
    const wrapper = shallow(
      <ErrorPage
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        message="Error !"
        detail={<span>Detail about the error</span>}
        imageSrc="image_src"
      />
    );
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('renders with default detail', () => {
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <ErrorPage message="Error !" imageSrc="image_src" />
    );
    
    expect(wrapper).toMatchSnapshot();
  });
});
