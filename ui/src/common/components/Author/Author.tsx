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
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'author' does not exist on type 'Readonly... Remove this comment to see the full error message
    const { author } = this.props;
    const roles = author.get('inspire_roles', []);

    if (roles.indexOf('editor') > -1) {
      return <Tooltip title="editor">(ed.)</Tooltip>;
    }

    return null;
  }

  renderAffiliationsList() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'author' does not exist on type 'Readonly... Remove this comment to see the full error message
    const { author } = this.props;
    const affiliations = author.get('affiliations');
    return (
      affiliations && (
        <span className="pl1 secondary-color">
          (
          // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
          <AffiliationList affiliations={affiliations} />
          )
        </span>
      )
    );
  }

  renderAuthorName() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'author' does not exist on type 'Readonly... Remove this comment to see the full error message
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

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
Author.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof Map' is not assignable to... Remove this comment to see the full error message
  author: PropTypes.instanceOf(Map).isRequired,
};

export default Author;
