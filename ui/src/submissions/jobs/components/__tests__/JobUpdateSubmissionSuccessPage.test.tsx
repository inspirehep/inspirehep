import React from 'react';
import { shallow } from 'enzyme';

import JobUpdateSubmissionSuccessPage from '../JobUpdateSubmissionSuccessPage';

describe('JobUpdateSubmissionSuccessPage', () => {
  it('renders', () => {
    const match = { params: { id: '1' } };
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<JobUpdateSubmissionSuccessPage match={match} />);
    expect(wrapper).toMatchSnapshot();
  });
});
