import userEvent from '@testing-library/user-event';
import { renderWithRouter, LocationDisplay } from '../../../fixtures/render';
import HowToSubmit from '../HowToSubmit';
import {
  SUBMISSIONS_AUTHOR,
  SUBMISSIONS_CONFERENCE,
  SUBMISSIONS_JOB,
  SUBMISSIONS_LITERATURE,
  SUBMISSIONS_SEMINAR,
} from '../../../common/routes';

describe('HowToSubmit', () => {
  it('renders the component with correct content', () => {
    const { getByText } = renderWithRouter(<HowToSubmit />);

    expect(getByText('Literature')).toBeInTheDocument();
    expect(getByText('Author')).toBeInTheDocument();
    expect(getByText('Job')).toBeInTheDocument();
    expect(getByText('Seminar')).toBeInTheDocument();
    expect(getByText('Conference')).toBeInTheDocument();
  });

  it('links each card to its submission form', async () => {
    const user = userEvent.setup();
    const { getAllByRole, getByTestId } = renderWithRouter(
      <>
        <HowToSubmit />
        <LocationDisplay />
      </>
    );

    const [literature, author, job, seminar, conference] = getAllByRole(
      'button',
      { name: 'Submit' }
    );

    await user.click(literature);
    expect(getByTestId('location-display')).toHaveTextContent(
      SUBMISSIONS_LITERATURE
    );

    await user.click(author);
    expect(getByTestId('location-display')).toHaveTextContent(
      SUBMISSIONS_AUTHOR
    );

    await user.click(job);
    expect(getByTestId('location-display')).toHaveTextContent(SUBMISSIONS_JOB);

    await user.click(seminar);
    expect(getByTestId('location-display')).toHaveTextContent(
      SUBMISSIONS_SEMINAR
    );

    await user.click(conference);
    expect(getByTestId('location-display')).toHaveTextContent(
      SUBMISSIONS_CONFERENCE
    );
  });
});
