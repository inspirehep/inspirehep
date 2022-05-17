import React from 'react';
import { shallow } from 'enzyme';
import AssignOneDifferentProfileAction from '../AssignOneDifferentProfileAction';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    id: 123,
  }),
}));

describe('AssignDifferentProfileAction', () => {
  it('renders', () => {
    const wrapper = shallow(
      <AssignOneDifferentProfileAction
        onAssign={jest.fn()}
        currentUserId={33}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders disabled', () => {
    const wrapper = shallow(
      <AssignOneDifferentProfileAction
        onAssign={jest.fn()}
        currentUserId={33}
        claimingUnclaimedPapersDisabled={false}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls onAssign on click', () => {
    const onAssign = jest.fn();
    const wrapper = shallow(
      <AssignOneDifferentProfileAction
        onAssign={onAssign}
        currentUserId={33}
        claimingUnclaimedPapersDisabled={false}
        claimingClaimedPapersDisabled
        userCanNotClaimProfile
      />
    );
    wrapper.find('[data-test-id="assign-self"]').simulate('click');
    expect(onAssign).toHaveBeenCalled();
  });
});
