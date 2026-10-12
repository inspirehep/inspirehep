import { fromJS } from 'immutable';
import { screen, within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import { getStore, mockActionCreator } from '../../fixtures/store';
import { renderWithProviders } from '../../fixtures/render';
import AuthorEditorContainer from '../author/containers/AuthorEditorContainer';
import { authorWithSchema } from './authorWithSchemaFixture';
import { saveAuthor } from '../../actions/recordEditor';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useParams: vi.fn().mockReturnValue({ id: 123 }) };
});

vi.mock('../../actions/recordEditor', async () => {
  const actual = await vi.importActual('../../actions/recordEditor');
  return { ...actual, saveAuthor: vi.fn() };
});

mockActionCreator(saveAuthor);

const renderEditor = () => {
  const store = getStore({
    recordEditor: fromJS({
      author: authorWithSchema,
      author_revisions: {},
      fetchAuthorError: null,
    }),
  });
  renderWithProviders(<AuthorEditorContainer />, { store });
};

const getNameValueInput = () =>
  within(screen.getByRole('row', { name: /value caret-down / })).getByRole(
    'textbox'
  );

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

  it('should submit valid modifications on Save click', async () => {
    const user = userEvent.setup();

    renderEditor();

    await user.click(screen.getByText(/name variants/));
    await user.click(screen.getByRole('button', { name: 'Add new' }));

    const nameVariantInput = within(
      screen.getByRole('row', { name: /name variants/ })
    ).getByRole('textbox');
    await user.type(nameVariantInput, 'test');

    await user.click(screen.getByRole('button', { name: /save/ }));

    expect(saveAuthor).toHaveBeenCalledWith(123, {
      ...authorWithSchema.record.metadata,
      name: {
        ...authorWithSchema.record.metadata.name,
        name_variants: ['test'],
      },
    });
  });
  it('should display validation error on invalid modifications on Save click', async () => {
    const user = userEvent.setup();

    renderEditor();

    const nameValueInput = getNameValueInput();
    await user.clear(nameValueInput);

    await user.click(screen.getByRole('button', { name: /save/ }));

    expect(screen.getByText('1 error')).toBeVisible();
    expect(
      screen.getByText("must have required property 'value'")
    ).toBeVisible();
    expect(saveAuthor).not.toHaveBeenCalled();
  });

  it('should undo all keystrokes in the same field at once on click undo', async () => {
    const user = userEvent.setup();
    renderEditor();
    const input = getNameValueInput();
    const initialValue = (input as HTMLInputElement).value;

    await user.type(input, 'abc');
    expect(input).toHaveValue(`${initialValue}abc`);

    await user.click(screen.getByRole('button', { name: /undo/i }));

    expect(input).toHaveValue(initialValue);
    expect(screen.getByRole('button', { name: /undo/i })).toBeDisabled();
  });

  it('should undo one step per field once the field loses focus on click undo', async () => {
    const user = userEvent.setup();
    renderEditor();
    const input = getNameValueInput();
    const initialValue = (input as HTMLInputElement).value;

    await user.type(input, 'abc');
    await user.tab();
    await user.type(input, 'def');
    expect(input).toHaveValue(`${initialValue}abcdef`);

    await user.click(screen.getByRole('button', { name: /undo/i }));
    expect(input).toHaveValue(`${initialValue}abc`);

    await user.click(screen.getByRole('button', { name: /undo/i }));
    expect(input).toHaveValue(initialValue);
  });

  it('should focus last updated field on undo', async () => {
    const user = userEvent.setup();
    renderEditor();
    const input = getNameValueInput();
    const initialValue = (input as HTMLInputElement).value;

    await user.type(input, 'abc');
    await user.tab();

    expect(input).not.toHaveFocus();
    expect(input).toHaveValue(`${initialValue}abc`);

    await user.click(screen.getByRole('button', { name: /undo/i }));
    expect(input).toHaveFocus();
    expect(input).toHaveValue(initialValue);
  });
});
