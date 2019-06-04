import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import ContactList from './ContactList';

class Contact extends Component {
  render() {
    const { contactDetails } = this.props;
    return (
      contactDetails && (
        <div>
          <strong>Contact: </strong>
          <ContactList contacts={contactDetails} wrapperClassName="di" />
        </div>
      )
    );
  }
}

Contact.propTypes = {
  contactDetails: PropTypes.instanceOf(List),
};

Contact.defaultProps = {
  contactDetails: null,
};

export default Contact;
