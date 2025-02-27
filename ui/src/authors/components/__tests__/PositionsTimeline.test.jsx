import React from 'react';
import { render } from '@testing-library/react';
import { fromJS } from 'immutable';

import PositionsTimeline from '../PositionsTimeline';

describe('PositionsTimeline', () => {
  it('renders with positions', () => {
    const positions = fromJS([
      {
        institution: 'Inst 1',
        display_date: '1990-1994',
        rank: 'UNDERGRADUATE',
      },
      {
        institution: 'Inst 2',
        display_date: '1994-2000',
        rank: 'PHD',
      },
      {
        institution: 'CERN',
        display_date: '2000-present',
        rank: 'STAFF',
        current: true,
      },
    ]);
    const { asFragment } = render(<PositionsTimeline positions={positions} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders with single position', () => {
    const positions = fromJS([
      {
        institution: 'Inst 1',
        rank: 'UNDERGRADUATE',
        display_date: 'present',
        current: true,
      },
    ]);
    const { asFragment } = render(<PositionsTimeline positions={positions} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders only first 3 by default', () => {
    const positions = fromJS([
      { institution: 'Inst 1' },
      { institution: 'Inst 2' },
      { institution: 'Inst 3' },
      { institution: 'Inst 4' },
      { institution: 'Inst 5' },
      { institution: 'Inst 6' },
    ]);
    const { asFragment } = render(<PositionsTimeline positions={positions} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders all when ExpandListToggle is toggled by default', () => {
    const positions = fromJS([
      { institution: 'Inst 1' },
      { institution: 'Inst 2' },
      { institution: 'Inst 3' },
      { institution: 'Inst 4' },
      { institution: 'Inst 5' },
      { institution: 'Inst 6' },
    ]);
    const { getByText, getByRole } = render(
      <PositionsTimeline positions={positions} />
    );
    const toggleButton = getByRole('button');
    toggleButton.click();
    expect(getByText('Inst 4')).toBeInTheDocument();
    expect(getByText('Inst 5')).toBeInTheDocument();
    expect(getByText('Inst 6')).toBeInTheDocument();
  });
});
