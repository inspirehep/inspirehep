import { fireEvent, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import AuthorListTestingPageContainer from '../AuthorListTestingPageContainer';
import http from '../../../../common/http';
import { getStore } from '../../../../fixtures/store';
import { renderWithProviders } from '../../../../fixtures/render';
import { BACKOFFICE_AUTHORLIST_TESTING } from '../../../../common/routes';

vi.mock('../../../../common/http', () => ({
  default: { post: vi.fn() },
}));

const mockPost = http.post as unknown as ReturnType<typeof vi.fn>;

describe('AuthorListTestingPageContainer', () => {
  const renderComponent = () =>
    renderWithProviders(<AuthorListTestingPageContainer />, {
      store: getStore(),
      route: BACKOFFICE_AUTHORLIST_TESTING,
    });

  beforeEach(() => {
    mockPost.mockReset();
  });

  it('renders the page with parse disabled when the input is empty', () => {
    renderComponent();

    expect(screen.getByTestId('authorlist-testing-page')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /parse author list/i })
    ).toBeDisabled();
  });

  it('posts the text and displays the parsed result', async () => {
    mockPost.mockResolvedValue({
      data: { authors: [{ full_name: 'Doe, John' }] },
    });
    renderComponent();

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'John Doe' },
    });
    fireEvent.click(screen.getByRole('button', { name: /parse author list/i }));

    await waitFor(() =>
      expect(screen.getByTestId('authorlist-result')).toBeInTheDocument()
    );
    expect(mockPost).toHaveBeenCalledWith('/editor/authorlist/text', {
      text: 'John Doe',
    });
    expect(screen.getByTestId('authorlist-result')).toHaveTextContent(
      'Doe, John'
    );
  });

  it('displays parser warnings when present', async () => {
    mockPost.mockResolvedValue({
      data: { authors: [], warnings: 'Could not parse affiliation' },
    });
    renderComponent();

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'John Doe' },
    });
    fireEvent.click(screen.getByRole('button', { name: /parse author list/i }));

    expect(await screen.findByText('Parser warnings')).toBeInTheDocument();
    expect(screen.getByText('Could not parse affiliation')).toBeInTheDocument();
  });

  it('displays the backend error message on failure', async () => {
    mockPost.mockRejectedValue({
      response: { data: { message: 'Invalid author list' } },
    });
    renderComponent();

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'garbage' },
    });
    fireEvent.click(screen.getByRole('button', { name: /parse author list/i }));

    expect(await screen.findByText('Parsing failed')).toBeInTheDocument();
    expect(screen.getByText('Invalid author list')).toBeInTheDocument();
    expect(screen.queryByTestId('authorlist-result')).not.toBeInTheDocument();
  });

  it('clears the input and result on Clear click', async () => {
    mockPost.mockResolvedValue({ data: { authors: [] } });
    renderComponent();

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'John Doe' },
    });
    fireEvent.click(screen.getByRole('button', { name: /parse author list/i }));
    await screen.findByTestId('authorlist-result');

    fireEvent.click(screen.getByRole('button', { name: /clear/i }));

    expect(screen.getByRole('textbox')).toHaveValue('');
    expect(screen.queryByTestId('authorlist-result')).not.toBeInTheDocument();
  });
});
