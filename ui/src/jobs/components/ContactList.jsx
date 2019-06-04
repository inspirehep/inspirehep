import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import ExternalLink from '../../common/components/ExternalLink';
import InlineList from '../../common/components/InlineList';

class ContactList extends Component {
  static renderContact(contact) {
    const email = contact.get('email');
    const name = contact.get('name');
    const renderParanthesis = name && email;
    return (
      <>
        {name && <span>{name}</span>}
        {renderParanthesis && ' ('}
        {email && <ExternalLink href={`mailto:${email}`}>{email}</ExternalLink>}
        {renderParanthesis && ')'}
      </>
    );
  }

  render() {
    const { contacts, wrapperClassName } = this.props;

    return (
      <InlineList
        items={contacts}
        renderItem={ContactList.renderContact}
        wrapperClassName={wrapperClassName}
        extractKey={contact => contact.get('email') || contact.get('name')}
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
