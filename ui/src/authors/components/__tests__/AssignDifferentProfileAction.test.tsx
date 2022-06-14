import React from 'react';
import { shallow } from 'enzyme';
import AssignDifferentProfileAction from '../AssignDifferentProfileAction';

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
  it('renders', () => {
    const wrapper = shallow(
      <AssignDifferentProfileAction
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ onAssign: any; disabled: false; currentUse... Remove this comment to see the full error message
        onAssign={jest.fn()}
        disabled={false}
        currentUserId={33}
        claimingUnclaimedPapersDisabled={false}
        claimingClaimedPapersDisabled={false}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders disabled', () => {
    const wrapper = shallow(
      <AssignDifferentProfileAction
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ onAssign: any; disabled: true; currentUser... Remove this comment to see the full error message
        onAssign={jest.fn()}
        disabled
        currentUserId={33}
        claimingUnclaimedPapersDisabled
        claimingClaimedPapersDisabled
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with claimingUnclaimedPapersDisabled', () => {
    const wrapper = shallow(
      <AssignDifferentProfileAction
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ onAssign: any; disabled: true; currentUser... Remove this comment to see the full error message
        onAssign={jest.fn()}
        disabled
        currentUserId={33}
        claimingUnclaimedPapersDisabled={false}
        claimingClaimedPapersDisabled
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('calls onAssign on assign-self click ', () => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onAssignWithoutClaimed = jest.fn();
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onAssignWithoutUnclaimed = jest.fn();
    const wrapper = shallow(
      <AssignDifferentProfileAction
        onAssignWithoutClaimed={onAssignWithoutClaimed}
        onAssignWithoutUnclaimed={onAssignWithoutUnclaimed}
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ onAssignWithoutClaimed: any; onAssignWitho... Remove this comment to see the full error message
        currentUserId={33}
        disabled={false}
        claimingUnclaimedPapersDisabled={false}
        claimingClaimedPapersDisabled={false}
      />
    );
    wrapper.find('[data-test-id="assign-self"]').simulate('click');
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(onAssignWithoutUnclaimed).toHaveBeenCalled();
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(onAssignWithoutClaimed).toHaveBeenCalled();
  });
});
