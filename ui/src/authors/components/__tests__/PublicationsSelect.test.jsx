import React from 'react';
import { render } from '@testing-library/react';

import PublicationsSelect from '../PublicationsSelect';

describe('PublicationsSelect', () => {
  it('sets publication selection on checkbox change', () => {
    const onSelectClaimedPapers = jest.fn();
    const onSelectUnclaimedPapers = jest.fn();
    const onSelectPapers = jest.fn();
    const { asFragment, getByRole } = render(
      <PublicationsSelect
        claimed
        isOwnProfile
        onSelectClaimedPapers={onSelectClaimedPapers}
        onSelectUnclaimedPapers={onSelectUnclaimedPapers}
        onSelectPapers={onSelectPapers}
      />
    );
    expect(asFragment()).toMatchSnapshot();
    getByRole('checkbox').click();
    expect(onSelectClaimedPapers).toHaveBeenCalled();
    expect(onSelectPapers).toHaveBeenCalled();
  });

  it('renders checked when selected', () => {
    const onSelectClaimedPapers = jest.fn();
    const onSelectUnclaimedPapers = jest.fn();
    const onSelectPapers = jest.fn();
    const { asFragment } = render(
      <PublicationsSelect
        claimed
        checked
        onSelectClaimedPapers={onSelectClaimedPapers}
        onSelectUnclaimedPapers={onSelectUnclaimedPapers}
        onSelectPapers={onSelectPapers}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });
  it('renders unchecked when not selected', () => {
    const onSelectClaimedPapers = jest.fn();
    const onSelectUnclaimedPapers = jest.fn();
    const onSelectPapers = jest.fn();
    const { asFragment } = render(
      <PublicationsSelect
        claimed
        checked={false}
        onSelectClaimedPapers={onSelectClaimedPapers}
        onSelectUnclaimedPapers={onSelectUnclaimedPapers}
        onSelectPapers={onSelectPapers}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
