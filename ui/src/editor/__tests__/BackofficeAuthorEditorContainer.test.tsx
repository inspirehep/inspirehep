import { fromJS } from 'immutable';
import { screen, within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import { getStore, mockActionCreator } from '../../fixtures/store';
import { renderWithProviders } from '../../fixtures/render';
import {
  fetchAuthorWorkflow,
  saveAuthorWorkflow,
} from '../../actions/editor/workflow';
import BackofficeAuthorEditorContainer from '../containers/BackofficeAuthorEditorContainer';
import { authorWorkflow, authorSchema } from './workflowFixtures';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn().mockReturnValue({ id: 123, type: 'authors' }),
  };
});

vi.mock('../../actions/editor/workflow', async () => {
  const actual = await vi.importActual('../../actions/editor/workflow');
  return {
    ...actual,
    fetchAuthorWorkflow: vi.fn(),
    saveAuthorWorkflow: vi.fn(),
  };
});

mockActionCreator(fetchAuthorWorkflow);
mockActionCreator(saveAuthorWorkflow);

const baseEditorState = {
  workflowData: {
    author: authorWorkflow,
    schema: authorSchema,
    fetchAuthorError: null,
    fetchSchemaError: null,
  },
  tickets: {
    queues: [],
    queuesError: null,
    users: [],
    usersError: null,
    items: [],
    ticketsError: null,
  },
};

const renderEditor = (editorState = baseEditorState) => {
  const store = getStore({ editor: fromJS(editorState) });
  renderWithProviders(<BackofficeAuthorEditorContainer />, { store });
  return store;
};

const getNameValueInput = () =>
  within(screen.getByRole('row', { name: /^value/ })).getByRole('textbox');

describe('<BackofficeAuthorEditorContainer/>', () => {
  it('should render generic error when fetching author failed', () => {
    const store = getStore({
      editor: fromJS({
        workflowData: {
          author: {},
          schema: null,
          fetchAuthorError: 500,
          fetchSchemaError: null,
        },
      }),
    });

    renderWithProviders(<BackofficeAuthorEditorContainer />, { store });

    expect(
      screen.getByText(/Something went wrong while trying to fetch/i)
    ).toBeVisible();
  });

  it('should render generic error when fetching schema failed', () => {
    const store = getStore({
      editor: fromJS({
        workflowData: {
          author: authorWorkflow,
          schema: null,
          fetchAuthorError: null,
          fetchSchemaError: 500,
        },
      }),
    });

    renderWithProviders(<BackofficeAuthorEditorContainer />, { store });

    expect(
      screen.getByText(/Something went wrong while trying to fetch/i)
    ).toBeVisible();
  });

  it('should not display revisions', () => {
    renderEditor();
    expect(screen.queryByText(/Last edit/)).not.toBeInTheDocument();
  });

  it('should display validation errors details on click and go to errored field on click', async () => {
    const user = userEvent.setup();

    renderEditor({
      ...baseEditorState,
      workflowData: {
        ...baseEditorState.workflowData,
        author: {
          data: {
            ...authorWorkflow.data,
            name: {
              preferred_name: 'David Lyle Burke',
              value: 'Burke, David Lyle, test, test',
            },
          },
          validation_errors: [
            {
              message:
                "'Burke, David Lyle, test, test' does not match '^[^,]+(,[^,]+)?(,?[^,]+)?$'",
              path: ['name', 'value'],
            },
          ],
        },
      },
    });

    const detailsButton = screen.getByRole('button', { name: /Details/ });
    await user.click(detailsButton);
    const errorProperty = /.name.value/;
    const linkToError = screen.getByRole('button', { name: errorProperty });
    await user.click(linkToError);
    expect(getNameValueInput()).toHaveFocus();

    await user.click(detailsButton);
    expect(screen.queryByText(errorProperty)).not.toBeInTheDocument();
  });

  describe('save', () => {
    it('should submit valid modifications on Save click', async () => {
      const user = userEvent.setup();

      renderEditor();

      await user.click(
        within(screen.getByTestId('name variants')).getByRole('button', {
          name: 'Add new',
        })
      );

      const nameVariantInput = within(
        screen.getByRole('row', { name: /name variants/ })
      ).getByRole('textbox');
      await user.type(nameVariantInput, 'test');

      await user.click(screen.getByRole('button', { name: /save/ }));

      expect(saveAuthorWorkflow).toHaveBeenCalledWith(123, {
        ...authorWorkflow.data,
        name: {
          ...authorWorkflow.data.name,
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
      expect(saveAuthorWorkflow).not.toHaveBeenCalled();
    });
    it('should display details on click and go to errored field on click and hide details on click', async () => {
      const user = userEvent.setup();

      renderEditor();

      const nameValueInput = getNameValueInput();
      await user.clear(nameValueInput);
      await user.click(screen.getByRole('button', { name: /save/ }));

      const detailsButton = screen.getByRole('button', { name: /Details/ });
      await user.click(detailsButton);
      const errorProperty = /.name.value/;
      const linkToError = screen.getByRole('button', { name: errorProperty });
      await user.click(linkToError);
      expect(nameValueInput).toHaveFocus();

      await user.click(detailsButton);
      expect(screen.queryByText(errorProperty)).not.toBeInTheDocument();
    });
  });
});
