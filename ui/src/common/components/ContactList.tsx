import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import ExternalLink from './ExternalLink.tsx';
import InlineList, { SEPARATOR_SEMICOLON } from './InlineList';
import { getRecordIdFromRef } from '../utils';
import { AUTHORS } from '../routes';

class ContactList extends Component {
  static renderContactName(contact) {
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

  static renderContact(contact) {
    const email = contact.get('email');
    const name = contact.get('name');
    const renderParanthesis = name && email;
    return (
      <>
        {name && ContactList.renderContactName(contact)}
        {renderParanthesis && ' ('}
        {email && <ExternalLink href={`mailto:${email}`}>{email}</ExternalLink>}
        {renderParanthesis && ')'}
      </>
    );
  }

  static contactEmailOrName(contact) {
    return contact.get('email') || contact.get('name');
  }

  render() {
    const { contacts } = this.props;

    return (
      <InlineList
        label="Contact"
        items={contacts}
        renderItem={ContactList.renderContact}
        separator={SEPARATOR_SEMICOLON}
        wrapperClassName="di"
        labelClassName="b"
        extractKey={ContactList.contactEmailOrName}
      />
    );
  }
}

ContactList.propTypes = {
  contacts: PropTypes.instanceOf(List),
};

ContactList.defaultProps = {
  contacts: null,
};

export default ContactList;
