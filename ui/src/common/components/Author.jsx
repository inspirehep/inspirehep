import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { Tooltip } from 'antd';

import AuthorAffiliationList from './AuthorAffiliationList';
import { AUTHORS } from '../routes';

class Author extends Component {
  getAuthorName() {
    const { author } = this.props;
    if (author.has('first_name')) {
      const firstName = author.get('first_name');
      const lastName = author.get('last_name', '');
      return `${firstName} ${lastName}`;
    }
    return author.get('full_name');
  }

  getAuthorRecid() {
    const { author } = this.props;
    const ref = author.getIn(['record', '$ref']);
    
    if (!ref) {
      return null;
    }

    const urlParts = ref.split('/');
    return urlParts[urlParts.length - 1];
  }

  renderRoleSuffix() {
    const { author } = this.props;
    const roles = author.get('inspire_roles', []);

    if (roles.indexOf('supervisor') > -1) {
      return <Tooltip title="supervisor">(supervisor)</Tooltip>;
    }

    if (roles.indexOf('editor') > -1) {
      return <Tooltip title="editor">(ed.)</Tooltip>;
    }

    return null;
  }

  renderAffiliationsList() {
    const { author } = this.props;
    const affiliations = author.get('affiliations');
    return (
      affiliations && (
        <span className="pl1 secondary-color">
          (
          <AuthorAffiliationList
            affiliations={affiliations.map(affiliation =>
              affiliation.get('value')
            )}
          />
          )
        </span>
      )
    );
  }

  renderAuthorName() {
    const recid = this.getAuthorRecid();
    if (recid != null) {
      return <Link to={`${AUTHORS}/${recid}`}>{this.getAuthorName()}</Link>
    }
    return <span>{this.getAuthorName()}</span>
  }

  render() {
    return (
      <div className="di">
        {this.renderAuthorName()}
        {this.renderAffiliationsList()}
        {this.renderRoleSuffix()}
      </div>
    );
  }
}

Author.propTypes = {
  author: PropTypes.instanceOf(Map).isRequired,
};

export default Author;
