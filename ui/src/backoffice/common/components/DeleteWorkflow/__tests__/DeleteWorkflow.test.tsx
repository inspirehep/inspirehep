import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeleteWorkflow from '../DeleteWorkflow';

jest.mock('../../../../../actions/backoffice', () => ({
  deleteWorkflow: jest.fn((id) => ({
    type: 'BACKOFFICE_DELETE_REQUEST',
    payload: id,
  })),
}));

describe('DeleteWorkflow component', () => {
  const mockDispatch = jest.fn();
  const mockId = 'test-id';

  beforeEach(() => {
    mockDispatch.mockClear();
  });

  it('should render delete button', () => {
    render(<DeleteWorkflow dispatch={mockDispatch} id={mockId} />);
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('should open the modal when the delete button is clicked', async () => {
    render(<DeleteWorkflow dispatch={mockDispatch} id={mockId} />);

    await waitFor(() => userEvent.click(screen.getByText('Delete')));

    await waitFor(() =>
      expect(
        screen.getByText(
          'Are you sure you want to delete workflow? This operation is unreversable.'
        )
      ).toBeVisible()
    );
  });

  it('should call dispatch with deleteWorkflow and close the modal on confirm', async () => {
    render(<DeleteWorkflow dispatch={mockDispatch} id={mockId} />);

    await waitFor(() => userEvent.click(screen.getByText('Delete')));

    await waitFor(() => userEvent.click(screen.getByText('Confirm')));

    await waitFor(() =>
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'BACKOFFICE_DELETE_REQUEST',
        payload: mockId,
      })
    );
  });
});
