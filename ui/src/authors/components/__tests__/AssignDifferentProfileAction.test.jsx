import React from 'react';
import { render, waitFor, fireEvent, screen } from '@testing-library/react';

import AssignDifferentProfileAction from '../AssignDifferentProfileAction';

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return { ...actual, useParams: jest.fn().mockReturnValue({ id: 123 }) };
});

describe('AssignDifferentProfileAction', () => {
  it('renders', () => {
    const { asFragment } = render(
      <AssignDifferentProfileAction
        onAssign={jest.fn()}
        disabled={false}
        currentUserId={33}
        claimingUnclaimedPapersDisabled={false}
        claimingClaimedPapersDisabled={false}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders disabled', () => {
    const { asFragment } = render(
      <AssignDifferentProfileAction
        onAssign={jest.fn()}
        disabled
        currentUserId={33}
        claimingUnclaimedPapersDisabled
        claimingClaimedPapersDisabled
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders with claimingUnclaimedPapersDisabled', () => {
    const { asFragment } = render(
      <AssignDifferentProfileAction
        onAssign={jest.fn()}
        disabled
        currentUserId={33}
        claimingUnclaimedPapersDisabled={false}
        claimingClaimedPapersDisabled
      />
    );
    expect(asFragment()).toMatchSnapshot();
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
