import React from 'react';
import { shallow } from 'enzyme';
import AssignOneDifferentProfileAction from '../AssignOneDifferentProfileAction';

jest.mock('react-router-dom', () => ({
  useParams: jest.fn().mockImplementation(() => ({
    id: 123,
  })),
}));

describe('AssignDifferentProfileAction', () => {
  it('renders for unclaimed paper', () => {
    const wrapper = shallow(
      <AssignOneDifferentProfileAction
        onAssignWithoutUnclaimed={jest.fn()}
        onAssignWithoutClaimed={jest.fn()}
        onAssignUserCanNotClaim={jest.fn()}
        currentUserId={33}
        claimingUnclaimedPapersDisabled={false}
        claimingClaimedPapersDisabled
        userCanNotClaimProfile={false}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders for claimed paper', () => {
    const wrapper = shallow(
      <AssignOneDifferentProfileAction
        onAssignWithoutUnclaimed={jest.fn()}
        onAssignWithoutClaimed={jest.fn()}
        onAssignUserCanNotClaim={jest.fn()}
        currentUserId={33}
        claimingUnclaimedPapersDisabled
        claimingClaimedPapersDisabled={false}
        userCanNotClaimProfile={false}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders for unclaimed paper with userCanNotClaimProfile', () => {
    const wrapper = shallow(
      <AssignOneDifferentProfileAction
        onAssign={jest.fn()}
        disabled
        currentUserId={33}
        claimingUnclaimedPapersDisabled={false}
        claimingClaimedPapersDisabled
        userCanNotClaimProfile
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls onAssign on for unclaimed paper that user cant claim', () => {
    const onAssignWithoutClaimed = jest.fn();
    const onAssignWithoutUnclaimed = jest.fn();
    const onAssignUserCanNotClaim = jest.fn();
    const wrapper = shallow(
      <AssignOneDifferentProfileAction
        onAssignWithoutClaimed={onAssignWithoutClaimed}
        onAssignWithoutUnclaimed={onAssignWithoutUnclaimed}
        onAssignUserCanNotClaim={onAssignUserCanNotClaim}
        currentUserId={33}
        claimingUnclaimedPapersDisabled={false}
        claimingClaimedPapersDisabled
        userCanNotClaimProfile
      />
    );
    wrapper.find('[data-test-id="assign-self"]').simulate('click');
    expect(onAssignUserCanNotClaim).toHaveBeenCalled();
  });

  it('calls onAssign on for claimed paper that user cant claim', () => {
    const onAssignWithoutClaimed = jest.fn();
    const onAssignWithoutUnclaimed = jest.fn();
    const onAssignUserCanNotClaim = jest.fn();
    const wrapper = shallow(
      <AssignOneDifferentProfileAction
        onAssignWithoutClaimed={onAssignWithoutClaimed}
        onAssignWithoutUnclaimed={onAssignWithoutUnclaimed}
        onAssignUserCanNotClaim={onAssignUserCanNotClaim}
        currentUserId={33}
        claimingUnclaimedPapersDisabled
        claimingClaimedPapersDisabled={false}
        userCanNotClaimProfile
      />
    );
    wrapper.find('[data-test-id="assign-self"]').simulate('click');
    expect(onAssignWithoutUnclaimed).toHaveBeenCalled();
  });

  it('calls onAssign on for claimed paper that user can claim', () => {
    const onAssignWithoutClaimed = jest.fn();
    const onAssignWithoutUnclaimed = jest.fn();
    const onAssignUserCanNotClaim = jest.fn();
    const wrapper = shallow(
      <AssignOneDifferentProfileAction
        onAssignWithoutClaimed={onAssignWithoutClaimed}
        onAssignWithoutUnclaimed={onAssignWithoutUnclaimed}
        onAssignUserCanNotClaim={onAssignUserCanNotClaim}
        currentUserId={33}
        claimingUnclaimedPapersDisabled
        claimingClaimedPapersDisabled={false}
        userCanNotClaimProfile={false}
      />
    );
    wrapper.find('[data-test-id="assign-self"]').simulate('click');
    expect(onAssignWithoutUnclaimed).toHaveBeenCalled();
  });

  it('calls onAssign on for unclaimed paper that user can claim', () => {
    const onAssignWithoutClaimed = jest.fn();
    const onAssignWithoutUnclaimed = jest.fn();
    const onAssignUserCanNotClaim = jest.fn();
    const wrapper = shallow(
      <AssignOneDifferentProfileAction
        onAssignWithoutClaimed={onAssignWithoutClaimed}
        onAssignWithoutUnclaimed={onAssignWithoutUnclaimed}
        onAssignUserCanNotClaim={onAssignUserCanNotClaim}
        currentUserId={33}
        claimingUnclaimedPapersDisabled={false}
        claimingClaimedPapersDisabled
        userCanNotClaimProfile={false}
      />
    );
    wrapper.find('[data-test-id="assign-self"]').simulate('click');
    expect(onAssignWithoutClaimed).toHaveBeenCalled();
  });
});
