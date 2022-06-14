import React from 'react';
import { shallow } from 'enzyme';
import AssignDifferentProfileAction from '../AssignDifferentProfileAction';

jest.mock('react-router-dom', () => ({
  useParams: jest.fn().mockImplementation(() => ({
    id: 123,
  })),
}));

describe('AssignDifferentProfileAction', () => {
  it('renders', () => {
    const wrapper = shallow(
      <AssignDifferentProfileAction
        onAssign={jest.fn()}
        disabled={false}
        currentUserId={33}
        claimingUnclaimedPapersDisabled={false}
        claimingClaimedPapersDisabled={false}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders disabled', () => {
    const wrapper = shallow(
      <AssignDifferentProfileAction
        onAssign={jest.fn()}
        disabled
        currentUserId={33}
        claimingUnclaimedPapersDisabled
        claimingClaimedPapersDisabled
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with claimingUnclaimedPapersDisabled', () => {
    const wrapper = shallow(
      <AssignDifferentProfileAction
        onAssign={jest.fn()}
        disabled
        currentUserId={33}
        claimingUnclaimedPapersDisabled={false}
        claimingClaimedPapersDisabled
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls onAssign on assign-self click ', () => {
    const onAssignWithoutClaimed = jest.fn();
    const onAssignWithoutUnclaimed = jest.fn();
    const wrapper = shallow(
      <AssignDifferentProfileAction
        onAssignWithoutClaimed={onAssignWithoutClaimed}
        onAssignWithoutUnclaimed={onAssignWithoutUnclaimed}
        currentUserId={33}
        disabled={false}
        claimingUnclaimedPapersDisabled={false}
        claimingClaimedPapersDisabled={false}
      />
    );
    wrapper.find('[data-test-id="assign-self"]').simulate('click');
    expect(onAssignWithoutUnclaimed).toHaveBeenCalled();
    expect(onAssignWithoutClaimed).toHaveBeenCalled();
  });
});
