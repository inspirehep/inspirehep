import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { Tooltip } from 'antd';

import AffiliationList from '../AffiliationList';
import UnlinkedAuthor from './UnlinkedAuthor';
import AuthorWithBAI from './AuthorWithBAI';
import LinkedAuthor from './LinkedAuthor';

class Author extends Component {
  renderRoleSuffix() {
    const { author } = this.props;
    const roles = author.get('inspire_roles', []);

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
          <AffiliationList affiliations={affiliations} />
          )
        </span>
      )
    );
  }

  renderAuthorName() {
    const { author } = this.props;
    if (author.has('record')) {
      return <LinkedAuthor author={author} />;
    }
    if (author.has('bai')) {
      return <AuthorWithBAI author={author} />;
    }
    return <UnlinkedAuthor author={author} />;
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
