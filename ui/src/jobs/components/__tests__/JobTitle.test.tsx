import React from 'react';
import { shallow } from 'enzyme';

import JobTitle from '../JobTitle';

describe('JobTitle', () => {
  it('renders with only position', () => {
    {/* @ts-ignore */}
    const wrapper = shallow(<JobTitle position="VP of Happiness" />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with position and external job id', () => {
    const wrapper = shallow(
      /* @ts-ignore */
      <JobTitle position="VP of Happiness" externalJobId="R00123" />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
