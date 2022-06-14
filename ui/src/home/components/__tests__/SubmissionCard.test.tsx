import React from 'react';
import { shallow } from 'enzyme';

import SubmissionCard from '../SubmissionCard';

describe('SubmissionCard', () => {
  it('renders with all props', () => {
    const wrapper = shallow(
      <SubmissionCard title="Literature" formLink="/submissions/literature">
        You can suggest us papers!
      </SubmissionCard>
    );
    expect(wrapper).toMatchSnapshot();
  });
});
