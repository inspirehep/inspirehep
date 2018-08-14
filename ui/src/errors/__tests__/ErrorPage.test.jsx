import React from 'react';
import { shallow } from 'enzyme';
import ErrorPage from '../components/ErrorPage';

describe('ErrorPage', () => {
  it('renders with correct props', () => {
    const statusCode = 404;
    const message = 'Message';
    const imageSrc = 'Some image';
    const wrapper = shallow(
      <ErrorPage
        statusCode={statusCode}
        message={message}
        imageSrc={imageSrc}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
