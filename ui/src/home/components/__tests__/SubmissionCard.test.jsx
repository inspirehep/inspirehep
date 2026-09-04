import userEvent from '@testing-library/user-event';
import SubmissionCard from '../SubmissionCard';
import { renderWithRouter, LocationDisplay } from '../../../fixtures/render';

describe('SubmissionCard', () => {
  it('renders with all props', async () => {
    const user = userEvent.setup();
    const title = 'Literature';
    const formLink = '/submissions/literature';
    const children = 'You can suggest us papers!';

    const { getByText, getByRole, getByTestId } = renderWithRouter(
      <>
        <SubmissionCard title={title} formLink={formLink}>
          {children}
        </SubmissionCard>
        <LocationDisplay />
      </>
    );

    expect(getByText(title)).toBeInTheDocument();
    expect(getByText(children)).toBeInTheDocument();

    await user.click(getByRole('button', { name: /Submit/i }));

    expect(getByTestId('location-display')).toHaveTextContent(formLink);
  });
});
