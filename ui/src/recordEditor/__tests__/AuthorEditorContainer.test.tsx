import { fromJS } from 'immutable';
import { screen } from '@testing-library/dom';
import { getStore } from '../../fixtures/store';
import { renderWithProviders } from '../../fixtures/render';
import AuthorEditorContainer from '../author/containers/AuthorEditorContainer';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useParams: vi.fn().mockReturnValue({ id: 123 }) };
});

describe('<AuthorEditorContainer/>', () => {
  it('should render specific error when not loggedIn', () => {
    const store = getStore({
      recordEditor: fromJS({
        author: {},
        author_revisions: {},
        fetchAuthorError: 401,
      }),
    });

    renderWithProviders(<AuthorEditorContainer />, { store });

    expect(
      screen.getByText(
        /You need to first login to InspireHep to edit the record/i
      )
    ).toBeVisible();
  });

  it('should render generic error when fetching author failed', () => {
    const store = getStore({
      recordEditor: fromJS({
        author: {},
        author_revisions: {},
        fetchAuthorError: 500,
      }),
    });

    renderWithProviders(<AuthorEditorContainer />, { store });

    expect(
      screen.getByText(/Something went wrong while trying to fetch/i)
    ).toBeVisible();
  });
});
