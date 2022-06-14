import React, { Component } from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Link } from 'react-router-dom';
import { List } from 'immutable';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import ExternalLink from './ExternalLink.tsx';
import InlineList, { SEPARATOR_SEMICOLON } from './InlineList';
import { getRecordIdFromRef } from '../utils';
import { AUTHORS } from '../routes';

type OwnProps = {
    contacts?: $TSFixMe; // TODO: PropTypes.instanceOf(List)
};

type Props = OwnProps & typeof ContactList.defaultProps;

class ContactList extends Component<Props> {

static defaultProps = {
    contacts: null,
};

  static renderContactName(contact: $TSFixMe) {
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

  static renderContact(contact: $TSFixMe) {
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

  static contactEmailOrName(contact: $TSFixMe) {
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

export default ContactList;
