import React from 'react';
import { shallow } from 'enzyme';

import SubmissionSuccessPage from '../SubmissionSuccessPage';

describe('SubmissionSuccessPage', () => {
  it('renders', () => {
    const wrapper = shallow(<SubmissionSuccessPage />);
    expect(wrapper).toMatchSnapshot();
  });
});
