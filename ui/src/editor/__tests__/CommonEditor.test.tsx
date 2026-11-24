import { within, screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { act, render } from '@testing-library/react';
import { fromJS, Map } from 'immutable';
import { authorWithSchema } from './authorWithSchemaFixture';
import CommonEditor from '../components/CommonEditor';
import prepareSchema from '../utils/prepareSchema';
import { renderWithProviders } from '../../fixtures/render';
import authorUiSchema from '../uiSchema/authorUiSchema';
import TabsObjectFieldTemplate from '../components/customTemplates/objectFieldTemplates/TabsObjectFieldTemplate';
import referencesUiSchema from '../uiSchema/literature/referencesUiSchema';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn().mockReturnValue({ id: 123, type: 'authors' }),
  };
});

const baseCommonEditorProps = {
  data: fromJS(authorWithSchema.record) as Map<string, any>,
  schema: prepareSchema(authorWithSchema.schema),
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
  describe('save', () => {
    it('should trim leading and trailing whitespace of values on save', async () => {
      const user = userEvent.setup();
      const save = vi.fn();
      renderEditor({
        ...baseCommonEditorProps,
        data: fromJS(authorWithSchema.record.metadata) as Map<string, any>,
        save,
      });
      const input = getNameValueInput();
      const initialValue = (input as HTMLInputElement).value;

      await user.clear(input);
      await user.type(input, `  ${initialValue}  `);
      await user.click(screen.getByRole('button', { name: /save/i }));

      expect(save).toHaveBeenCalledTimes(1);
      const savedRecord = save.mock.calls[0][1];
      expect(savedRecord.name.value).toBe(initialValue);
    });
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

  describe('references requests', () => {
    const referencesSchema = {
      type: 'object',
      properties: {
        references: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              reference: {
                type: 'object',
                properties: { label: { type: 'string' } },
              },
            },
          },
        },
      },
    } as any;

    it('should make the form read-only while linking references and restore it afterwards', async () => {
      const user = userEvent.setup();
      let resolveRequest: (value: unknown) => void = () => {};
      const dispatch = vi.fn(
        () =>
          new Promise((resolve) => {
            resolveRequest = resolve;
          })
      );
      renderWithProviders(
        <CommonEditor
          {...baseCommonEditorProps}
          data={
            fromJS({ references: [{ reference: { label: '1' } }] }) as Map<
              string,
              any
            >
          }
          schema={referencesSchema}
          uiSchema={{
            'ui:ObjectFieldTemplate': TabsObjectFieldTemplate,
            'ui:options': {
              tabs: [{ name: 'References', properties: ['references'] }],
            },
            references: referencesUiSchema,
          }}
          dispatch={dispatch as any}
        />
      );
      await user.click(screen.getByRole('tab', { name: /References/ }));
      const item = screen.getByTestId('list-item');
      await user.click(within(item).getByRole('button', { expanded: false }));
      const getLabel = () => within(item).getByRole('textbox');
      expect(getLabel()).toBeEnabled();

      await user.click(screen.getByRole('button', { name: /Refresh to link/ }));
      expect(getLabel()).toBeDisabled();
      expect(dispatch).toHaveBeenCalledTimes(1);

      await act(async () => resolveRequest(undefined));
      expect(getLabel()).toBeEnabled();
    });
  });
});
