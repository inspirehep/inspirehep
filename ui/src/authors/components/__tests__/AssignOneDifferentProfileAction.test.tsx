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
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ onAssignWithoutUnclaimed: any; onAssignWit... Remove this comment to see the full error message
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
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ onAssignWithoutUnclaimed: any; onAssignWit... Remove this comment to see the full error message
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
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ onAssign: any; disabled: true; currentUser... Remove this comment to see the full error message
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
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ onAssignWithoutClaimed: any; onAssignWitho... Remove this comment to see the full error message
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
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ onAssignWithoutClaimed: any; onAssignWitho... Remove this comment to see the full error message
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
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ onAssignWithoutClaimed: any; onAssignWitho... Remove this comment to see the full error message
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
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ onAssignWithoutClaimed: any; onAssignWitho... Remove this comment to see the full error message
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
