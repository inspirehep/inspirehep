import { fromJS } from 'immutable';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { screen, waitFor, within } from '@testing-library/dom';
import { getStore } from '../../fixtures/store';
import { renderWithProviders } from '../../fixtures/render';
import TicketsContainer from '../author/components/Tickets';
import { createTicket, resolveTicket } from '../../actions/recordEditor';

vi.mock('../../actions/recordEditor', () => ({
  createTicket: vi.fn(),
  resolveTicket: vi.fn(),
}));

const baseRecordEditorState = {
  author: {},
  author_revisions: [],
  fetchAuthorError: null,
  current_author_revision: null,
  revisionError: null,
  queues: [
    { name: 'authors', id: '123' },
    { name: 'literature', id: '456' },
  ],
  queuesError: null as string | null,
  users: [
    { name: 'John Doe', id: '789', email: 'john.doe@cern.ch' },
    { name: 'Jane Doe', id: '000', email: 'jane.doe@cern.ch' },
  ],
  usersError: null as string | null,
  tickets: [
    {
      u_functional_category: 'German curation',
      assigned_to: 'John Doe',
      sys_id: '237ddc8487049b50152564230cbb35a9',
      date: '2026-10-15 11:32:19',
      link: 'https://cerntraining.service-now.com/',
      subject: 'test ticket 1',
      description: 'test ticket 1 description',
    },
    {
      u_functional_category: 'Author curation',
      assigned_to: 'Jane Doe',
      sys_id: '237ddc8487049b50152564230cbb35a8',
      date: '2026-10-14 13:32:19',
      link: 'https://cerntraining.service-now.com/',
      subject: 'test ticket 2',
      description: 'test ticket 2 description',
    },
    {
      u_functional_category: 'Literature',
      assigned_to: 'John Doe',
      sys_id: '237ddc8487049b50152564230cbb35a7',
      date: '2026-10-13 10:32:19',
      link: 'https://cerntraining.service-now.com/',
      subject: 'test ticket 3',
      description: 'test ticket 3 description',
    },
  ],
  ticketsError: null as string | null,
};

const renderTicketsContainer = (
  storeData = baseRecordEditorState,
  dispatchAction = vi.fn()
) => {
  const store = getStore({ recordEditor: fromJS(storeData) });
  renderWithProviders(
    <TicketsContainer controlNumber="100" dispatchAction={dispatchAction} />,
    { store }
  );
  return store;
};

const selectOption = async (
  testId: string,
  optionName: string,
  user: UserEvent
) => {
  await user.click(within(screen.getByTestId(testId)).getByRole('combobox'));
  await user.click(await screen.findByTitle(optionName));
};

describe('<Tickets />', () => {
  it('should create a new ticket', async () => {
    const user = userEvent.setup();
    const subject = 'a great subject for the ticket';
    const description = 'some things to do';
    renderTicketsContainer();

    await user.click(screen.getByRole('button', { name: 'New Ticket' }));

    await selectOption('select-queue', 'authors', user);
    await selectOption('select-user', 'Jane Doe', user);
    await user.type(screen.getByPlaceholderText('Subject'), subject);
    await user.type(
      screen.getByPlaceholderText('Describe the ticket'),
      description
    );

    await user.click(screen.getByRole('button', { name: 'New' }));
    expect(createTicket).toHaveBeenCalledWith('100', {
      subject,
      description,
      queue: 'authors',
      owner: 'Jane Doe',
    });
  });
  it.each([
    [true, false],
    [false, true],
  ])(
    'should handle modal when ticket creation returns %s',
    async (created, modalStaysOpen) => {
      const user = userEvent.setup();
      const dispatchAction = vi.fn().mockResolvedValue(created);
      renderTicketsContainer(baseRecordEditorState, dispatchAction);

      await user.click(screen.getByRole('button', { name: 'New Ticket' }));
      await selectOption('select-queue', 'authors', user);
      await user.type(screen.getByPlaceholderText('Subject'), 'a subject');
      await user.click(screen.getByRole('button', { name: 'New' }));

      await waitFor(() => expect(dispatchAction).toHaveBeenCalled());
      if (modalStaysOpen) {
        expect(screen.getByPlaceholderText('Subject')).toHaveValue('a subject');
      } else {
        await waitFor(() =>
          expect(screen.queryByPlaceholderText('Subject')).not.toBeVisible()
        );
      }
    }
  );
  it('should display an error on fetch queues error', async () => {
    const user = userEvent.setup();
    renderTicketsContainer({
      ...baseRecordEditorState,
      queuesError: 'Error while fetching queues',
    });

    await user.click(screen.getByRole('button', { name: 'New Ticket' }));

    expect(
      within(screen.getByTestId('select-queue')).queryByRole('combobox')
    ).not.toBeInTheDocument();
    expect(screen.getByText('Error while fetching queues')).toBeInTheDocument();
  });
  it('should display an error on fetch users error', async () => {
    const user = userEvent.setup();
    renderTicketsContainer({
      ...baseRecordEditorState,
      usersError: 'Error while fetching users',
    });

    await user.click(screen.getByRole('button', { name: 'New Ticket' }));

    expect(
      within(screen.getByTestId('select-user')).queryByRole('combobox')
    ).not.toBeInTheDocument();
    expect(screen.getByText('Error while fetching users')).toBeInTheDocument();
  });
  it('should display first ticket and other ones on more click', async () => {
    const user = userEvent.setup();
    renderTicketsContainer();

    expect(screen.getByText('German curation')).toBeVisible();
    expect(screen.getByText('2026-10-15 11:32:19')).toBeVisible();

    expect(screen.queryByText('Author curation')).not.toBeInTheDocument();
    expect(screen.queryByText('2026-10-14 13:32:19')).not.toBeInTheDocument();
    expect(screen.queryByText('Literature')).not.toBeInTheDocument();
    expect(screen.queryByText('2026-10-13 10:32:19')).not.toBeInTheDocument();

    await user.hover(screen.getByRole('button', { name: 'More' }));

    expect(await screen.findByText('Author curation')).toBeInTheDocument();
    expect(screen.getByText('2026-10-14 13:32:19')).toBeInTheDocument();
    expect(screen.getByText('Literature')).toBeInTheDocument();
    expect(screen.getByText('2026-10-13 10:32:19')).toBeInTheDocument();
  });
  it('should display error when fetching tickets failed', () => {
    const errorMessage = 'Unable to fetch tickets';
    renderTicketsContainer({
      ...baseRecordEditorState,
      tickets: [],
      ticketsError: errorMessage,
    });

    expect(screen.getByText(errorMessage)).toBeVisible();
  });
  it('should resolve ticket on click', async () => {
    const user = userEvent.setup();
    renderTicketsContainer();

    await user.click(screen.getByRole('button', { name: 'check-circle' }));
    expect(resolveTicket).toHaveBeenCalledWith(
      '100',
      '237ddc8487049b50152564230cbb35a9'
    );
  });
});
