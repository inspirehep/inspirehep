import { within, screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import { fromJS, Map } from 'immutable';
import { authorWithSchema } from './authorWithSchemaFixture';
import CommonEditor from '../components/CommonEditor';
import prepareAuthorSchema from '../utils/prepareAuthorSchema';
import { renderWithProviders } from '../../fixtures/render';
import authorUiSchema from '../uiSchema/authorUiSchema';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn().mockReturnValue({ id: 123, type: 'authors' }),
  };
});

const baseCommonEditorProps = {
  data: fromJS(authorWithSchema.record) as Map<string, any>,
  schema: prepareAuthorSchema(authorWithSchema.schema),
  error: null,
  dispatch: vi.fn(),
  save: vi.fn(),
  withRevisions: false as const,
};

const renderEditor = (props = baseCommonEditorProps) => {
  renderWithProviders(<CommonEditor {...props} uiSchema={authorUiSchema} />);
};

const getNameValueInput = () =>
  within(screen.getByRole('row', { name: /^value/ })).getByRole('textbox');

describe('<CommonEditor />', () => {
  it('should render specific error when not loggedIn', () => {
    const props = {
      ...baseCommonEditorProps,
      data: fromJS({}) as Map<string, any>,
      schema: null,
      error: 401,
    };

    render(<CommonEditor {...props} uiSchema={authorUiSchema} />);

    expect(
      screen.getByText(
        /You need to first login to InspireHep to edit the record/i
      )
    ).toBeVisible();
  });
  describe('undo', () => {
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
});
