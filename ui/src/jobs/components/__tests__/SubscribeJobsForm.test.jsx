import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import SubscribeJobsForm from '../SubscribeJobsForm';

describe('SubscribeJobsForm', () => {
  it('renders', () => {
    const { asFragment } = render(<SubscribeJobsForm onSubmit={jest.fn()} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('calls onSubmit on Formik submit', async () => {
    const onSubmit = jest.fn();
    const data = {
      email: 'harun@cern.ch',
      first_name: 'Harun',
      last_name: 'Urhan',
    };
    const { getByTestId } = render(<SubscribeJobsForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: data.email },
    });
    fireEvent.change(screen.getByPlaceholderText(/first name/i), {
      target: { value: data.first_name },
    });
    fireEvent.change(screen.getByPlaceholderText(/last name/i), {
      target: { value: data.last_name },
    });
    const submitButton = getByTestId('subscribe-submit');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining(data),
        expect.any(Object)
      );
    });
  });
});
