import React from 'react';
import { shallow } from 'enzyme';
import { render, waitFor, fireEvent, screen } from '@testing-library/react';

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

  it('calls onAssign on assign-self click ', async () => {
    const onAssign = jest.fn();
    const { container } = render(
      <AssignDifferentProfileAction
        onAssign={onAssign}
        currentUserId={33}
        disabled={false}
      />
    );

    const dropdown = container.getElementsByClassName(
      'ant-dropdown-trigger'
    )[0];

    await waitFor(() => fireEvent.mouseOver(dropdown));
    await waitFor(() => screen.getByTestId('assign-self').click());

    await waitFor(() => expect(onAssign).toHaveBeenCalled());
  });
});
