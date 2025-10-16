import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeleteWorkflow from '../DeleteWorkflow';
import { AUTHORS_PID_TYPE } from '../../../../../common/constants';
import { deleteWorkflow } from '../../../../../actions/backoffice';

jest.mock('../../../../../actions/backoffice', () => ({
  deleteWorkflow: jest.fn((_type, id) => ({
    type: 'BACKOFFICE_DELETE_REQUEST',
  })),
}));

describe('DeleteWorkflow component', () => {
  const onConfirm = jest.fn();
  const mockId = 'test-id';

  beforeEach(() => {
    onConfirm.mockClear();
  });

  it('should render delete button', () => {
    render(<DeleteWorkflow onConfirm={onConfirm} />);
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('should open the modal when the delete button is clicked', async () => {
    render(<DeleteWorkflow onConfirm={onConfirm} />);

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
    const mockDispatch = jest.fn();
    const onConfirm = () => {
      mockDispatch(deleteWorkflow(AUTHORS_PID_TYPE, mockId));
    };
    render(<DeleteWorkflow onConfirm={onConfirm} />);

    await waitFor(() => userEvent.click(screen.getByText('Delete')));

    await waitFor(() => userEvent.click(screen.getByText('Confirm')));

    await waitFor(() =>
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'BACKOFFICE_DELETE_REQUEST',
      })
    );
  });
});
