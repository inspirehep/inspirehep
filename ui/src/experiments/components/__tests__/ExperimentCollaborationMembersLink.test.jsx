import React from 'react';
import { shallow } from 'enzyme';
import ExperimentCollaborationMembersLink from '../ExperimentCollaborationMembersLink';

describe('ExperimentCollaborationMembersLink', () => {
  it('renders', () => {
    const wrapper = shallow(
      <ExperimentCollaborationMembersLink recordId={1234} />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
