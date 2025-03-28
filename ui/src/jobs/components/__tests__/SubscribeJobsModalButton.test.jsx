import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import SubscribeJobsModalButton from '../SubscribeJobsModalButton';
import subscribeJobMailingList from '../../subscribeJobMailingList';

jest.mock('../../subscribeJobMailingList');

describe('SubscribeJobsModalButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with initial state', () => {
    const { getByTestId } = render(<SubscribeJobsModalButton />);
    expect(getByTestId('subscribe-jobs-button')).toBeInTheDocument();
  });

  it('sets modal visible on button click', () => {
    const { getByTestId } = render(<SubscribeJobsModalButton />);
    const button = getByTestId('subscribe-jobs-button');
    fireEvent.click(button);
    expect(screen.getByText('Subscribe')).toBeInTheDocument();
  });

  it('renders with error alert if hasError', async () => {
    subscribeJobMailingList.mockRejectedValue(new Error('An error occurred'));
    render(<SubscribeJobsModalButton />);
    fireEvent.click(screen.getByTestId('subscribe-jobs-button'));
    expect(screen.getByText('Subscribe')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'harun@cern.ch' },
    });
    fireEvent.change(screen.getByPlaceholderText(/first name/i), {
      target: { value: 'Harun' },
    });
    fireEvent.change(screen.getByPlaceholderText(/last name/i), {
      target: { value: 'Urhan' },
    });

    fireEvent.click(screen.getByTestId('subscribe-submit'));
    await waitFor(() => {
      expect(subscribeJobMailingList).toHaveBeenCalledTimes(1);
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(
        screen.getByText('Could not subscribe, please try again.')
      ).toBeInTheDocument();
    });
  });

  it('calls subscribeJobMailingList on form submit and render confirmation', async () => {
    subscribeJobMailingList.mockResolvedValue({});
    render(<SubscribeJobsModalButton />);
    fireEvent.click(screen.getByTestId('subscribe-jobs-button'));
    expect(screen.getByText('Subscribe')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'harun@cern.ch' },
    });
    fireEvent.change(screen.getByPlaceholderText(/first name/i), {
      target: { value: 'Harun' },
    });
    fireEvent.change(screen.getByPlaceholderText(/last name/i), {
      target: { value: 'Urhan' },
    });

    fireEvent.click(screen.getByTestId('subscribe-submit'));

    await waitFor(() => {
      expect(subscribeJobMailingList).toHaveBeenCalledTimes(1);
      expect(subscribeJobMailingList).toHaveBeenCalledWith({
        email: 'harun@cern.ch',
        first_name: 'Harun',
        last_name: 'Urhan',
      });
      expect(
        screen.getByText('You have successfully subscribed!')
      ).toBeInTheDocument();
    });
  });
});
