import { fromJS, Map } from 'immutable';
import { screen, within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import { getStore, mockActionCreator } from '../../fixtures/store';
import { renderWithProviders } from '../../fixtures/render';
import AuthorEditorContainer from '../author/containers/AuthorEditorContainer';
import { authorWithSchema } from './authorWithSchemaFixture';
import {
  fetchAuthorRevisionData,
  revertToRevision,
  saveAuthor,
} from '../../actions/recordEditor/record';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useParams: vi.fn().mockReturnValue({ id: 123 }) };
});

vi.mock('../../actions/recordEditor/record', async () => {
  const actual = await vi.importActual('../../actions/recordEditor/record');
  return {
    ...actual,
    saveAuthor: vi.fn(),
    fetchAuthorRevisionData: vi.fn(),
    revertToRevision: vi.fn(),
  };
});

mockActionCreator(saveAuthor);
mockActionCreator(fetchAuthorRevisionData);
mockActionCreator(revertToRevision);

const lastRevision = {
  updated: '2026-07-20T10:30:00',
  userEmail: 'jane.doe@cern.ch',
  revisionId: 100,
  recUuid: '53dad093-b1e2-4d5c-a109-8800005dc9f1',
  transactionId: 200,
};

const otherRevision1 = {
  updated: '2026-07-17T10:30:00',
  userEmail: 'john.doe@cern.ch',
  revisionId: 99,
  recUuid: '5d457a9a-a18a-4c47-86c7-3538e8fb1b80',
  transactionId: 130,
};

const otherRevision2 = {
  updated: '2026-07-15T10:30:00',
  userEmail: 'jane.doe@cern.ch',
  revisionId: 98,
  recUuid: 'feb56603-6cb9-428a-8452-a54f90588e49',
  transactionId: 110,
};

const baseRecordEditorState = fromJS({
  recordData: {
    author: authorWithSchema,
    author_revisions: [lastRevision, otherRevision1, otherRevision2],
    fetchAuthorError: null,
    current_author_revision: null,
    revisionError: null,
  },
  tickets: {
    queues: [],
    queuesError: null,
    users: [],
    usersError: null,
    items: [],
    ticketsError: null,
  },
}) as Map<string, any>;

const renderEditor = () => {
  const store = getStore({ recordEditor: baseRecordEditorState });
  renderWithProviders(<AuthorEditorContainer />, { store });
  return store;
};

const revisionPreferredName = 'David in another version';

const selectOtherRevision1 = async (
  user: ReturnType<typeof userEvent.setup>,
  store: ReturnType<typeof getStore>
) => {
  const stateWithRevision = {
    ...store.getState(),
    recordEditor: baseRecordEditorState.setIn(
      ['recordData', 'current_author_revision'],
      fromJS({
        ...authorWithSchema.record.metadata,
        name: {
          ...authorWithSchema.record.metadata.name,
          preferred_name: revisionPreferredName,
        },
      })
    ),
  };
  store.getState = () => stateWithRevision;

  await user.hover(
    screen.getByRole('button', {
      name: `Last edit on Jul 20, 2026, 10:30:00 AM by ${lastRevision.userEmail}`,
    })
  );
  await user.click(
    await screen.findByRole('button', {
      name: `On Jul 17, 2026, 10:30:00 AM by ${otherRevision1.userEmail}`,
    })
  );
};

const getNameValueInput = () =>
  within(screen.getByRole('row', { name: /value caret-down / })).getByRole(
    'textbox'
  );

describe('<AuthorEditorContainer/>', () => {
  it('should render specific error when not loggedIn', () => {
    const store = getStore({
      recordEditor: fromJS({
        recordData: {
          author: {},
          author_revisions: [],
          fetchAuthorError: 401,
        },
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
        recordData: {
          author: {},
          author_revisions: [],
          fetchAuthorError: 500,
        },
      }),
    });

    renderWithProviders(<AuthorEditorContainer />, { store });

    expect(
      screen.getByText(/Something went wrong while trying to fetch/i)
    ).toBeVisible();
  });

  describe('save', () => {
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
    it('should display details on click and go to errored field on click and hide details on click', async () => {
      const user = userEvent.setup();

      renderEditor();

      const nameValueInput = getNameValueInput();
      await user.clear(nameValueInput);
      await user.click(screen.getByRole('button', { name: /save/ }));

      const detailsButton = screen.getByRole('button', { name: /Details/ });
      await user.click(detailsButton);
      const errorProperty = '.name.value';
      const linkToError = screen.getByRole('button', { name: errorProperty });
      await user.click(linkToError);
      expect(nameValueInput).toHaveFocus();

      await user.click(detailsButton);
      expect(screen.queryByText(errorProperty)).not.toBeInTheDocument();
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

  describe('revisions', () => {
    it('should display fetch revision when selected', async () => {
      const user = userEvent.setup();
      renderEditor();

      const lastRevisionButton = screen.getByRole('button', {
        name: `Last edit on Jul 20, 2026, 10:30:00 AM by ${lastRevision.userEmail}`,
      });
      await user.hover(lastRevisionButton);

      const revision1 = await screen.findByRole('button', {
        name: `On Jul 17, 2026, 10:30:00 AM by ${otherRevision1.userEmail}`,
      });
      await user.click(revision1);

      expect(fetchAuthorRevisionData).toHaveBeenCalledWith(
        otherRevision1.recUuid,
        otherRevision1.transactionId
      );
    });

    it('should display currentRevision if exists', async () => {
      const store = getStore({
        recordEditor: fromJS({
          recordData: {
            author: authorWithSchema,
            author_revisions: [lastRevision, otherRevision1, otherRevision2],
            fetchAuthorError: null,
            current_author_revision: {
              ids: [
                {
                  schema: 'ORCID',
                  value: '0000-0003-1866-1950',
                },
              ],
              name: {
                preferred_name: 'David in another version',
                value: 'Burke, David Lyle',
              },
              status: 'active',
            },
            revisionError: null,
          },
          tickets: {
            queues: [],
            queuesError: null,
            users: [],
            usersError: null,
            items: [],
            ticketsError: null,
          },
        }),
      });
      renderWithProviders(<AuthorEditorContainer />, { store });

      expect(
        await screen.findByDisplayValue('David in another version')
      ).toBeVisible();
      expect(
        screen.queryByDisplayValue(
          authorWithSchema.record.metadata.name.preferred_name
        )
      ).not.toBeInTheDocument();
    });

    it('should go back to current when current has not been updated', async () => {
      const user = userEvent.setup();
      const store = renderEditor();
      const { preferred_name: currentPreferredName } =
        authorWithSchema.record.metadata.name;

      await selectOtherRevision1(user, store);

      expect(
        await screen.findByDisplayValue(revisionPreferredName)
      ).toBeVisible();
      expect(
        screen.queryByDisplayValue(currentPreferredName)
      ).not.toBeInTheDocument();

      await user.click(
        screen.getByRole('button', { name: /or go back to current/i })
      );

      expect(
        await screen.findByDisplayValue(currentPreferredName)
      ).toBeVisible();
      expect(
        screen.queryByDisplayValue(revisionPreferredName)
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /last edit on/i })
      ).toBeVisible();
    });

    it('should go back to current when current has been updated', async () => {
      const user = userEvent.setup();
      const store = renderEditor();
      const { preferred_name: currentPreferredName } =
        authorWithSchema.record.metadata.name;

      await user.type(
        screen.getByDisplayValue(currentPreferredName),
        ' edited'
      );
      const updatedPreferredName = `${currentPreferredName} edited`;
      expect(screen.getByDisplayValue(updatedPreferredName)).toBeVisible();

      await selectOtherRevision1(user, store);

      expect(
        await screen.findByDisplayValue(revisionPreferredName)
      ).toBeVisible();
      expect(
        screen.queryByDisplayValue(updatedPreferredName)
      ).not.toBeInTheDocument();

      await user.click(
        screen.getByRole('button', { name: /or go back to current/i })
      );

      expect(
        await screen.findByDisplayValue(updatedPreferredName)
      ).toBeVisible();
      expect(
        screen.queryByDisplayValue(revisionPreferredName)
      ).not.toBeInTheDocument();
    });

    it('should revert to revision on click', async () => {
      const user = userEvent.setup();
      const store = renderEditor();

      await selectOtherRevision1(user, store);

      await user.click(screen.getByRole('button', { name: /revert to/i }));

      expect(revertToRevision).toHaveBeenCalledWith(
        123,
        otherRevision1.revisionId
      );
      expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
    });

    it('should not allow editing the form while a revision is displayed', async () => {
      const user = userEvent.setup();
      const store = renderEditor();

      await selectOtherRevision1(user, store);

      expect(
        await screen.findByDisplayValue(revisionPreferredName)
      ).toBeDisabled();
    });
  });
});
