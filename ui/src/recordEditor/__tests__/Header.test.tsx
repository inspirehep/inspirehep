import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Header, { HeaderProps } from '../author/components/Header';
import { renderWithProviders } from '../../fixtures/render';

const renderHeaderWithProps = (overrides: Partial<HeaderProps> = {}) => {
  renderWithProviders(
    <Header
      controlNumber="123"
      revisions={[]}
      onSave={vi.fn()}
      onUndo={vi.fn()}
      canUndo={false}
      revisionError={null}
      resetToLastUpdate={vi.fn()}
      isViewingRevision={false}
      dispatch={vi.fn()}
      {...overrides}
    />
  );
};

const lastRevision = {
  updated: '2026-07-20T10:30:00',
  userEmail: 'jane.doe@cern.ch',
  revisionId: 100,
  recUuid: '53dad093-b1e2-4d5c-a109-8800005dc9f1',
  transactionId: 200,
};

const otherRevision1 = {
  updated: '2026-07-17T10:30:00',
  userEmail: 'john.doe@cern.ch',
  revisionId: 99,
  recUuid: '5d457a9a-a18a-4c47-86c7-3538e8fb1b80',
  transactionId: 130,
};

const otherRevision2 = {
  updated: '2026-07-15T10:30:00',
  userEmail: 'jane.doe@cern.ch',
  revisionId: 98,
  recUuid: 'feb56603-6cb9-428a-8452-a54f90588e49',
  transactionId: 110,
};

describe('Header', () => {
  it('should display last edition information and other revisions dropdown', async () => {
    const user = userEvent.setup();

    renderHeaderWithProps({
      revisions: [lastRevision, otherRevision1, otherRevision2],
    });

    const lastRevisionButton = screen.getByRole('button', {
      name: `Last edit on Jul 20, 2026, 10:30:00 AM by ${lastRevision.userEmail}`,
    });
    await user.hover(lastRevisionButton);

    const revision1Label = await screen.findByText(
      `On Jul 17, 2026, 10:30:00 AM by ${otherRevision1.userEmail}`
    );
    const revision2Label = screen.getByText(
      `On Jul 15, 2026, 10:30:00 AM by ${otherRevision2.userEmail}`
    );
    expect(revision1Label).toBeInTheDocument();
    expect(revision2Label).toBeInTheDocument();
  });

  it('should call onUndo when the undo button is clicked', async () => {
    const user = userEvent.setup();
    const onUndo = vi.fn();
    renderHeaderWithProps({ canUndo: true, onUndo });

    await user.click(screen.getByRole('button', { name: /undo/i }));

    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  it('should disable the undo button when there is nothing to undo', () => {
    renderHeaderWithProps({ canUndo: false });

    expect(screen.getByRole('button', { name: /undo/i })).toBeDisabled();
  });

  it('should disable save and undo when a revision is selected', async () => {
    const user = userEvent.setup();

    renderHeaderWithProps({
      revisions: [lastRevision, otherRevision1],
    });

    const lastRevisionButton = screen.getByRole('button', {
      name: `Last edit on Jul 20, 2026, 10:30:00 AM by ${lastRevision.userEmail}`,
    });
    await user.hover(lastRevisionButton);

    const revision1 = await screen.findByRole('button', {
      name: `On Jul 17, 2026, 10:30:00 AM by ${otherRevision1.userEmail}`,
    });
    await user.click(revision1);

    expect(screen.getByRole('button', { name: 'Revert to' })).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'or go back to current' })
    ).toBeVisible();
    expect(
      screen.getByText(
        `Jul 17, 2026, 10:30:00 AM by ${otherRevision1.userEmail}`
      )
    ).toBeVisible();

    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /undo/i })).toBeDisabled();
  });

  it('should display revision error', () => {
    const errorMessage = 'Some big error';
    renderHeaderWithProps({
      revisions: [lastRevision],
      revisionError: errorMessage,
    });

    expect(
      screen.queryByText(
        `Last edit on Jul 20, 2026, 10:30:00 AM by ${lastRevision.userEmail}`
      )
    ).not.toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeVisible();
  });

  it('should display help modal on button click', async () => {
    const user = userEvent.setup();
    renderHeaderWithProps();

    await user.click(screen.getByRole('button', { name: 'question-circle' }));

    expect(
      screen.getByRole('link', { name: 'inspire-schemas docs' })
    ).toHaveAttribute(
      'href',
      'https://inspire-schemas.readthedocs.io/en/latest/schemas/index.html'
    );
  });
});
