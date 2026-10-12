import { fireEvent, screen } from '@testing-library/react';
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

describe('AuthorListTestingPageContainer output', () => {
  const submit = (data: unknown) => {
    mockPost.mockResolvedValue({ data });
    renderWithProviders(<AuthorListTestingPageContainer />, {
      store: getStore(),
      route: BACKOFFICE_AUTHORLIST_TESTING,
    });
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'John Doe' },
    });
    fireEvent.click(screen.getByRole('button', { name: /parse author list/i }));
  };

  beforeEach(() => {
    mockPost.mockReset();
  });

  it('shows warnings as lines and authors as YAML', async () => {
    submit({
      authors: [
        { full_name: 'Doe, John', raw_affiliations: [{ value: 'CERN' }] },
      ],
      warnings: ['Author without firstname: Doe', 'Found no affiliations'],
    });

    const warnings = await screen.findByTestId('authorlist-warnings');
    expect(warnings).toHaveTextContent('Author without firstname: Doe');
    expect(warnings).toHaveTextContent('Found no affiliations');

    const result = screen.getByTestId('authorlist-result');
    expect(result).toHaveTextContent('full_name: Doe, John');
    expect(result).toHaveTextContent('value: CERN');
  });

  it('does not show the warnings alert when there are none', async () => {
    submit({ authors: [{ full_name: 'Doe, John' }] });

    await screen.findByTestId('authorlist-result');
    expect(screen.queryByTestId('authorlist-warnings')).not.toBeInTheDocument();
  });
});
