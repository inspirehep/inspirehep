import React from 'react';
import { render, waitFor, fireEvent, screen } from '@testing-library/react';

import ToolAction from '../ToolAction';

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return { ...actual, useParams: jest.fn().mockReturnValue({ id: 123 }) };
});

describe('ToolAction', () => {
  it('renders', () => {
    const { asFragment } = render(
      <ToolAction
        onAssignToConference={jest.fn()}
        onExportToCds={jest.fn()}
        selectionSize={3}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders disabled', () => {
    const { asFragment } = render(
      <ToolAction
        onAssignToConference={jest.fn()}
        disabledBulkAssign
        onExportToCds={jest.fn()}
        selectionSize={3}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('calls onAssignToConference on assign-conference click ', async () => {
    const onAssignToConference = jest.fn();
    const { container } = render(
      <ToolAction
        onAssignToConference={onAssignToConference}
        onExportToCds={jest.fn()}
        selectionSize={3}
      />
    );

    const dropdown = container.getElementsByClassName(
      'ant-dropdown-trigger'
    )[0];

    await waitFor(() => fireEvent.mouseOver(dropdown));
    await waitFor(() => screen.getByTestId('assign-conference').click());

    await waitFor(() => expect(onAssignToConference).toHaveBeenCalled());
  });

  it('opens modal on export-to-CDS click ', async () => {
    const onAssignToConference = jest.fn();
    const onExportToCds = jest.fn();

    const { container } = render(
      <ToolAction
        onAssignToConference={onAssignToConference}
        onExportToCds={onExportToCds}
        selectionSize={3}
      />
    );

    const dropdown = container.getElementsByClassName(
      'ant-dropdown-trigger'
    )[0];

    await waitFor(() => fireEvent.mouseOver(dropdown));
    await waitFor(() => screen.getByTestId('export-to-CDS').click());

    await waitFor(
      () => expect(screen.getByTestId('export-modal')).toBeInTheDocument
    );
  });
});
