import React from 'react';
import { render, waitFor, fireEvent, screen } from '@testing-library/react';

import AssignOneDifferentProfileAction from '../AssignOneDifferentProfileAction';

jest.mock('react-router-dom', () => ({
  useParams: jest.fn().mockImplementation(() => ({
    id: 123,
  })),
}));

describe('AssignDifferentProfileAction', () => {
  it('renders', () => {
    const { asFragment } = render(
      <AssignOneDifferentProfileAction
        onAssign={jest.fn()}
        currentUserId={33}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders disabled', () => {
    const { asFragment } = render(
      <AssignOneDifferentProfileAction
        onAssign={jest.fn()}
        currentUserId={33}
        claimingUnclaimedPapersDisabled={false}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('calls onAssign on click', async () => {
    const onAssign = jest.fn();
    const { container } = render(
      <AssignOneDifferentProfileAction
        onAssign={onAssign}
        currentUserId={33}
        claimingUnclaimedPapersDisabled={false}
        claimingClaimedPapersDisabled
        userCanNotClaimProfile
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
