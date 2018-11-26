import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { Tooltip } from 'antd';

import ExternalLink from './ExternalLink';

class AuthorLink extends Component {
  getAuthorHref() {
    const { author, recordId } = this.props;
    let href = `//inspirehep.net/author/profile/${author.get('full_name')}`;
    if (recordId != null) {
      href = `${href}?recid=${recordId}`;
    }
    return href;
  }

  getAffiliationHref() {
    const { author } = this.props;
    const affiliation = author.getIn(['affiliations', 0, 'value']);
    return `//inspirehep.net/search?cc=Institutions&p=institution:"${affiliation}"`;
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

  renderAffiliationLink() {
    const { author } = this.props;
    const affiliation = author.getIn(['affiliations', 0, 'value']);
    if (affiliation) {
      const affiliationHref = this.getAffiliationHref();
      return (
        <span className="pl1">
          (
          <ExternalLink className="secondary-link" href={affiliationHref}>
            {affiliation}
          </ExternalLink>
          )
        </span>
      );
    }
    return null;
  }

  render() {
    const authorHref = this.getAuthorHref();

    return (
      <div className="di">
        <ExternalLink href={authorHref}>{this.getFullName()}</ExternalLink>
        {this.renderAffiliationLink()}
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
