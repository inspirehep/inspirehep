import React from 'react';
import { shallow } from 'enzyme';
import AssignOneDifferentProfileAction from '../AssignOneDifferentProfileAction';

// @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
jest.mock('react-router-dom', () => ({
  // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
  useParams: jest.fn().mockImplementation(() => ({
    id: 123,
  })),
}));

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('AssignDifferentProfileAction', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders for unclaimed paper', () => {
    const wrapper = shallow(
      <AssignOneDifferentProfileAction
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onAssignWithoutUnclaimed={jest.fn()}
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onAssignWithoutClaimed={jest.fn()}
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onAssignUserCanNotClaim={jest.fn()}
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ onAssignWithoutUnclaimed: any; onAssignWit... Remove this comment to see the full error message
        currentUserId={33}
        claimingUnclaimedPapersDisabled={false}
        claimingClaimedPapersDisabled
        userCanNotClaimProfile={false}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders for claimed paper', () => {
    const wrapper = shallow(
      <AssignOneDifferentProfileAction
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onAssignWithoutUnclaimed={jest.fn()}
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onAssignWithoutClaimed={jest.fn()}
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onAssignUserCanNotClaim={jest.fn()}
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ onAssignWithoutUnclaimed: any; onAssignWit... Remove this comment to see the full error message
        currentUserId={33}
        claimingUnclaimedPapersDisabled
        claimingClaimedPapersDisabled={false}
        userCanNotClaimProfile={false}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders for unclaimed paper with userCanNotClaimProfile', () => {
    const wrapper = shallow(
      <AssignOneDifferentProfileAction
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ onAssign: any; disabled: true; currentUser... Remove this comment to see the full error message
        onAssign={jest.fn()}
        disabled
        currentUserId={33}
        claimingUnclaimedPapersDisabled={false}
        claimingClaimedPapersDisabled
        userCanNotClaimProfile
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('calls onAssign on for unclaimed paper that user cant claim', () => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onAssignWithoutClaimed = jest.fn();
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onAssignWithoutUnclaimed = jest.fn();
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onAssignUserCanNotClaim = jest.fn();
    const wrapper = shallow(
      <AssignOneDifferentProfileAction
        onAssignWithoutClaimed={onAssignWithoutClaimed}
        onAssignWithoutUnclaimed={onAssignWithoutUnclaimed}
        onAssignUserCanNotClaim={onAssignUserCanNotClaim}
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ onAssignWithoutClaimed: any; onAssignWitho... Remove this comment to see the full error message
        currentUserId={33}
        claimingUnclaimedPapersDisabled={false}
        claimingClaimedPapersDisabled
        userCanNotClaimProfile
      />
    );
    wrapper.find('[data-test-id="assign-self"]').simulate('click');
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(onAssignUserCanNotClaim).toHaveBeenCalled();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('calls onAssign on for claimed paper that user cant claim', () => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onAssignWithoutClaimed = jest.fn();
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onAssignWithoutUnclaimed = jest.fn();
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onAssignUserCanNotClaim = jest.fn();
    const wrapper = shallow(
      <AssignOneDifferentProfileAction
        onAssignWithoutClaimed={onAssignWithoutClaimed}
        onAssignWithoutUnclaimed={onAssignWithoutUnclaimed}
        onAssignUserCanNotClaim={onAssignUserCanNotClaim}
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ onAssignWithoutClaimed: any; onAssignWitho... Remove this comment to see the full error message
        currentUserId={33}
        claimingUnclaimedPapersDisabled
        claimingClaimedPapersDisabled={false}
        userCanNotClaimProfile
      />
    );
    wrapper.find('[data-test-id="assign-self"]').simulate('click');
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(onAssignWithoutUnclaimed).toHaveBeenCalled();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('calls onAssign on for claimed paper that user can claim', () => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onAssignWithoutClaimed = jest.fn();
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onAssignWithoutUnclaimed = jest.fn();
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onAssignUserCanNotClaim = jest.fn();
    const wrapper = shallow(
      <AssignOneDifferentProfileAction
        onAssignWithoutClaimed={onAssignWithoutClaimed}
        onAssignWithoutUnclaimed={onAssignWithoutUnclaimed}
        onAssignUserCanNotClaim={onAssignUserCanNotClaim}
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ onAssignWithoutClaimed: any; onAssignWitho... Remove this comment to see the full error message
        currentUserId={33}
        claimingUnclaimedPapersDisabled
        claimingClaimedPapersDisabled={false}
        userCanNotClaimProfile={false}
      />
    );
    wrapper.find('[data-test-id="assign-self"]').simulate('click');
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(onAssignWithoutUnclaimed).toHaveBeenCalled();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('calls onAssign on for unclaimed paper that user can claim', () => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onAssignWithoutClaimed = jest.fn();
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onAssignWithoutUnclaimed = jest.fn();
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onAssignUserCanNotClaim = jest.fn();
    const wrapper = shallow(
      <AssignOneDifferentProfileAction
        onAssignWithoutClaimed={onAssignWithoutClaimed}
        onAssignWithoutUnclaimed={onAssignWithoutUnclaimed}
        onAssignUserCanNotClaim={onAssignUserCanNotClaim}
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ onAssignWithoutClaimed: any; onAssignWitho... Remove this comment to see the full error message
        currentUserId={33}
        claimingUnclaimedPapersDisabled={false}
        claimingClaimedPapersDisabled
        userCanNotClaimProfile={false}
      />
    );
    wrapper.find('[data-test-id="assign-self"]').simulate('click');
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(onAssignWithoutClaimed).toHaveBeenCalled();
  });
});
