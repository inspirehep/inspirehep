import React from 'react';
import { shallow } from 'enzyme';

import SubmissionSuccess from '../SubmissionSuccess';

describe('SubmissionSuccess', () => {
  it('renders with default message', () => {
    const wrapper = shallow(<SubmissionSuccess />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with custom message', () => {
    const wrapper = shallow(
      <SubmissionSuccess message={<strong>Custom Success</strong>} />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
