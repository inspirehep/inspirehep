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
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <SubmissionSuccess message={<strong>Custom Success</strong>} />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
