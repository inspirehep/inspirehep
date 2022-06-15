import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { List } from 'immutable';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import ExternalLink from './ExternalLink.tsx';
import InlineList, { SEPARATOR_SEMICOLON } from './InlineList';
import { getRecordIdFromRef } from '../utils';
import { AUTHORS } from '../routes';

class ContactList extends Component {
  static renderContactName(contact: any) {
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

  static renderContact(contact: any) {
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

  static contactEmailOrName(contact: any) {
    return contact.get('email') || contact.get('name');
  }

  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'contacts' does not exist on type 'Readon... Remove this comment to see the full error message
    const { contacts } = this.props;

    return (
      <InlineList
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
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

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
ContactList.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  contacts: PropTypes.instanceOf(List),
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
ContactList.defaultProps = {
  contacts: null,
};

export default ContactList;
