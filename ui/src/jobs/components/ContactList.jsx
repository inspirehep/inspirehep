import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import ExternalLink from '../../common/components/ExternalLink';
import InlineList from '../../common/components/InlineList';
import { getRecordIdFromRef } from '../../common/utils';
import { AUTHORS } from '../../common/routes';

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
    const { contacts, wrapperClassName } = this.props;

    return (
      <InlineList
        items={contacts}
        renderItem={ContactList.renderContact}
        separateItemsClassName="separate-items-with-semicolon"
        wrapperClassName={wrapperClassName}
        extractKey={ContactList.contactEmailOrName}
      />
    );
  }
}

ContactList.propTypes = {
  contacts: PropTypes.instanceOf(List),
  wrapperClassName: PropTypes.string,
};

ContactList.defaultProps = {
  contacts: null,
  wrapperClassName: null,
};

export default ContactList;
