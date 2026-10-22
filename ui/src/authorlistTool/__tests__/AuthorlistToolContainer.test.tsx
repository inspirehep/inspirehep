import { fromJS } from 'immutable';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/dom';
import { submitAuthorlist } from '../../actions/authorlist';
import { getStore, mockActionCreator } from '../../fixtures/store';
import { renderWithProviders } from '../../fixtures/render';
import AuthorlistToolContainer from '../AuthorlistToolContainer';

vi.mock('../../actions/authorlist', async () => {
  const actual = await vi.importActual('../../actions/authorlist');
  return {
    ...actual,
    submitAuthorlist: vi.fn(),
  };
});

mockActionCreator(submitAuthorlist);

const baseAuthorlistState = {
  loading: false,
  authors: null as null | unknown[],
  warnings: null as null | string[],
  error: null as null | string,
};

const renderAuthorlistToolContainer = (state = baseAuthorlistState) => {
  const store = getStore({ authorlist: fromJS(state) });
  renderWithProviders(<AuthorlistToolContainer />, { store });
  return store;
};

describe('AuthorlistToolContainer', () => {
  it('should submit form on format click', async () => {
    const user = userEvent.setup();
    const authorlist = 'some author list to submit';
    renderAuthorlistToolContainer();

    await user.type(screen.getByRole('textbox'), authorlist);
    await user.click(screen.getByRole('button', { name: 'Format' }));

    expect(submitAuthorlist).toHaveBeenCalledWith(authorlist);
  });
  it('should clear form on click', async () => {
    const user = userEvent.setup();
    const authorlist = 'some author list to submit';
    renderAuthorlistToolContainer();

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, authorlist);
    expect(textarea).toHaveValue(authorlist);

    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(textarea).toHaveValue('');
  });
  it('should display authors and warnings', () => {
    renderAuthorlistToolContainer({
      ...baseAuthorlistState,
      authors: [
        {
          full_name: 'Einstein, A.',
        },
        {
          full_name: 'Bohr, N.',
          raw_affiliations: [
            {
              value: 'ETH',
            },
          ],
        },
      ],
      warnings: ['Author without affiliation-id.'],
    });

    expect(
      screen.getByText(
        'There are some problems with the input. Please check the following warnings:'
      )
    ).toBeVisible();
    expect(screen.getByText('Author without affiliation-id.')).toBeVisible();

    const yamlOutput = screen.getByText(/full_name: Einstein, A\./);
    expect(yamlOutput).toBeVisible();
    expect(yamlOutput).toHaveTextContent('- full_name: Bohr, N.');
    expect(yamlOutput).toHaveTextContent('raw_affiliations:');
    expect(yamlOutput).toHaveTextContent('- value: ETH');
  });
  it('should display errors', () => {
    renderAuthorlistToolContainer({
      ...baseAuthorlistState,
      error: 'some error',
    });

    expect(screen.getByText('some error')).toBeVisible();
  });
  it('should disable buttons on loading', () => {
    renderAuthorlistToolContainer({
      ...baseAuthorlistState,
      loading: true,
    });

    expect(screen.getByRole('button', { name: 'Format' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Clear' })).toBeDisabled();
  });
});
