import { renderWithProviders } from '../../../../fixtures/render';

import JobUpdateSubmissionSuccessPage from '../JobUpdateSubmissionSuccessPage';
import { getStore } from '../../../../fixtures/store';

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useParams: () => ({ id: '1' }),
}));

describe('JobUpdateSubmissionSuccessPage', () => {
  it('renders', () => {
    const { asFragment } = renderWithProviders(
      <JobUpdateSubmissionSuccessPage />,
      {
        route: '/submissions/jobs/1/success',
        store: getStore(),
      }
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
