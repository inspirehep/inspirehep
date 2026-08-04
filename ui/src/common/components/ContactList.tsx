import { Link } from 'react-router-dom';
import { List, Map } from 'immutable';

import LinkWithTargetBlank from './LinkWithTargetBlank';
import InlineDataList, { SEPARATOR_SEMICOLON } from './InlineList';
import { getRecordIdFromRef } from '../utils';
import { AUTHORS } from '../routes';
import EventTracker from './EventTracker';

const ContactList = ({
  contacts = List([]),
  page,
}: {
  contacts?: List<string>;
  page: string;
}) => {
  function renderContactName(contact: Map<string, string>) {
    const name = contact.get('name');
    const contactRecordId = getRecordIdFromRef(
      contact.getIn(['record', '$ref']) as string
    );
    return contactRecordId ? (
      <Link to={`${AUTHORS}/${contactRecordId}`}>{name}</Link>
    ) : (
      <span>{name}</span>
    );
  }

  const renderContact = (contact: Map<string, string>) => {
    const email = contact.get('email');
    const name = contact.get('name');
    const renderParanthesis = name && email;
    return (
      <>
        {name && renderContactName(contact)}
        {renderParanthesis && ' ('}
        {email && (
          <EventTracker
            eventCategory={page}
            eventAction="Mail"
            eventId="Contact list"
          >
            <LinkWithTargetBlank href={`mailto:${email}`}>
              {email}
            </LinkWithTargetBlank>
          </EventTracker>
        )}
        {renderParanthesis && ')'}
      </>
    );
  };

  const contactEmailOrName = (contact: Map<string, string>) =>
    contact.get('email') || contact.get('name');

  return (
    <InlineDataList
      label="Contact"
      items={contacts}
      renderItem={renderContact}
      separator={SEPARATOR_SEMICOLON}
      wrapperClassName="di"
      labelClassName="b"
      extractKey={contactEmailOrName}
    />
  );
};

export default ContactList;
