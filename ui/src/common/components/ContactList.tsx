import React from 'react';
import { Link } from 'react-router-dom';
import { List, Map } from 'immutable';

import LinkWithTargetBlank from './LinkWithTargetBlank';
import InlineList, { SEPARATOR_SEMICOLON } from './InlineList';
import { getRecordIdFromRef } from '../utils';
import { AUTHORS } from '../routes';

const ContactList = ({ contacts }: { contacts: List<string> }) => {
  function renderContactName(contact: Map<string, string>) {
    const name = contact.get('name');
    const contactRecordId = getRecordIdFromRef(
      contact.getIn(['record', '$ref'])
    );
    return contactRecordId ? (
      <Link to={`${AUTHORS}/${contactRecordId}`}>{name}</Link>
    ) : (
      <span>{name}</span>
    );
  }

  function renderContact(contact: Map<string, string>) {
    const email = contact.get('email');
    const name = contact.get('name');
    const renderParanthesis = name && email;
    return (
      <>
        {name && renderContactName(contact)}
        {renderParanthesis && ' ('}
        {email && (
          <LinkWithTargetBlank href={`mailto:${email}`}>
            {email}
          </LinkWithTargetBlank>
        )}
        {renderParanthesis && ')'}
      </>
    );
  }

  function contactEmailOrName(contact: Map<string, string>) {
    return contact.get('email') || contact.get('name');
  }

  return (
    <InlineList
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

ContactList.defaultProps = {
  contacts: null,
};

export default ContactList;
