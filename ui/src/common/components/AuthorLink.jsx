import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { Tooltip } from 'antd';

import ExternalLink from './ExternalLink';
import AuthorAffiliationList from './AuthorAffiliationList';

class AuthorLink extends Component {
  getAuthorHref() {
    const { author, recordId } = this.props;
    let href = `//inspirehep.net/author/profile/${author.get('full_name')}`;
    if (recordId != null) {
      href = `${href}?recid=${recordId}`;
    }
    return href;
  }

  getFullName() {
    const { author } = this.props;
    if (author.has('first_name')) {
      const firstName = author.get('first_name');
      const lastName = author.get('last_name', '');
      return `${firstName} ${lastName}`;
    }
    return author.get('full_name');
  }

  renderEditorSuffix() {
    const { author } = this.props;
    const roles = author.get('inspire_roles', []);

    if (roles.includes('editor')) {
      return <Tooltip title="editor">(ed.)</Tooltip>;
    }
    return null;
  }

  renderAffiliationsList() {
    const { author } = this.props;
    const affiliations = author.get('affiliations');
    return (
      affiliations && (
        <span className="pl1">
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

  render() {
    const authorHref = this.getAuthorHref();
    return (
      <div className="di">
        <ExternalLink href={authorHref}>{this.getFullName()}</ExternalLink>
        {this.renderAffiliationsList()}
        {this.renderEditorSuffix()}
      </div>
    );
  }
}

AuthorLink.propTypes = {
  author: PropTypes.instanceOf(Map).isRequired,
  recordId: PropTypes.number,
};

AuthorLink.defaultProps = {
  recordId: undefined,
};

export default AuthorLink;
