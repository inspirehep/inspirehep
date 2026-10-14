import { Button, Input, Modal, Popover, Select, Tag } from 'antd';
import { List, Map } from 'immutable';
import TextArea from 'antd/lib/input/TextArea';
import { CheckCircleFilled } from '@ant-design/icons';
import { useState } from 'react';
import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import './Tickets.less';
import { legacy_connect as connect } from 'react-redux';
import { RootState } from '../../../types';
import { HttpClientWrapper } from '../../../common/http';
import { Queue, Ticket, TicketFromApi, toTicket, User } from '../../types';
import { createTicket, resolveTicket } from '../../../actions/recordEditor';

interface TicketItemProps {
  ticket: Ticket;
  onResolveTicket: (ticketId: string) => void;
}

function TicketItem({ ticket, onResolveTicket }: TicketItemProps) {
  return (
    <div className="ticket-item">
      <Tag variant="solid" color="gold">
        {ticket.category}
      </Tag>
      <Popover
        content={ticket.description}
        title={ticket.subject}
        styles={{
          container: {
            maxWidth: '600px',
            maxHeight: '400px',
            overflow: 'auto',
          },
          content: {
            whiteSpace: 'pre-wrap',
          },
        }}
      >
        <a
          href={ticket.link}
          target="_blank"
          rel="noreferrer"
          className="ticket-link"
        >
          {ticket.date}
        </a>
      </Popover>
      <button
        type="button"
        onClick={() => onResolveTicket(ticket.id)}
        className="resolve-button"
      >
        <CheckCircleFilled style={{ color: '#52c41a' }} />
      </button>
    </div>
  );
}

interface TicketsProps {
  tickets: List<Map<string, any>>;
  ticketsError: string | null;
  queues: List<Map<string, any>>;
  queuesError: string | null;
  users: List<Map<string, any>>;
  usersError: string | null;
  dispatchAction: ThunkDispatch<RootState, HttpClientWrapper, Action>;
  controlNumber: string;
}

function Tickets({
  tickets,
  ticketsError,
  queues,
  queuesError,
  users,
  usersError,
  dispatchAction,
  controlNumber,
}: TicketsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState<string | undefined>();
  const [selectedUser, setSelectedUser] = useState<string | undefined>();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const ticketsData = (tickets.toJS() as TicketFromApi[])
    .filter((ticket) => ticket.u_functional_category !== 'HEP_conflicts')
    .map((ticket) => toTicket(ticket));

  const queuesData = queues.toJS() as Queue[];
  const queuesOptions = queuesData.map((queue) => ({
    value: queue.name,
    label: queue.name,
  }));
  const usersData = users.toJS() as User[];
  const usersOptions = usersData.map((user) => ({
    value: user.name,
    label: user.name,
  }));

  const resetNewTicket = () => {
    setDescription('');
    setSelectedQueue(undefined);
    setSubject('');
    setSelectedUser(undefined);
  };

  const isSubjectEmpty = subject.trim().length === 0;

  const saveTicket = async () => {
    if (!selectedQueue || isSubjectEmpty) {
      return;
    }
    const payload = {
      queue: selectedQueue,
      owner: selectedUser,
      description,
      subject,
    };
    setIsCreating(true);
    const created = await dispatchAction(createTicket(controlNumber, payload));
    setIsCreating(false);
    if (created) {
      setIsModalOpen(false);
      resetNewTicket();
    }
  };

  const onCancelNewTicket = () => {
    setIsModalOpen(false);
    resetNewTicket();
  };

  const onResolveTicket = (ticketId: string) => {
    dispatchAction(resolveTicket(controlNumber, ticketId));
  };

  return (
    <>
      {ticketsData.length > 0 ? (
        <TicketItem ticket={ticketsData[0]} onResolveTicket={onResolveTicket} />
      ) : (
        ticketsError && <div className="ticket-error">{ticketsError}</div>
      )}
      {ticketsData.length > 1 && (
        <Popover
          content={ticketsData.slice(1).map((ticket) => (
            <TicketItem
              ticket={ticket}
              key={ticket.id}
              onResolveTicket={onResolveTicket}
            />
          ))}
          color="#34495e"
        >
          <Button size="small">More</Button>
        </Popover>
      )}
      <Button variant="solid" color="gold" onClick={() => setIsModalOpen(true)}>
        New Ticket
      </Button>
      <Modal
        title="New Ticket"
        open={isModalOpen}
        onCancel={onCancelNewTicket}
        onOk={() => saveTicket()}
        okText="New"
        confirmLoading={isCreating}
        width={800}
        okButtonProps={{ disabled: !selectedQueue || isSubjectEmpty }}
      >
        <div className="ticket-modal">
          <div className="label">Queue</div>
          <div className="input" data-testid="select-queue">
            {queuesError ? (
              <div className="ticket-error">{queuesError}</div>
            ) : (
              <Select
                style={{ width: 200 }}
                placeholder="Select a queue"
                onChange={(newValue) => setSelectedQueue(newValue)}
                value={selectedQueue}
                options={queuesOptions}
              />
            )}
          </div>
          <div className="label">Owner</div>
          <div className="input" data-testid="select-user">
            {usersError ? (
              <div className="ticket-error">{usersError}</div>
            ) : (
              <Select
                style={{ width: 200 }}
                showSearch={{ optionFilterProp: 'label' }}
                placeholder="Select a user"
                onChange={(newValue) => setSelectedUser(newValue)}
                value={selectedUser}
                options={usersOptions}
              />
            )}
          </div>
          <div className="label">Subject</div>
          <div className="input">
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
            />
          </div>
          <div className="label">Description</div>
          <div className="input">
            <TextArea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the ticket"
              rows={6}
              style={{ borderRadius: '2px' }}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}

const stateToProps = (state: RootState) => ({
  tickets: state.recordEditor.get('tickets'),
  ticketsError: state.recordEditor.get('ticketsError'),
  queues: state.recordEditor.get('queues'),
  queuesError: state.recordEditor.get('queuesError'),
  users: state.recordEditor.get('users'),
  usersError: state.recordEditor.get('usersError'),
});

const TicketsContainer = connect(stateToProps)(Tickets);

export default TicketsContainer;
