import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'antd';
import { Map } from 'immutable';

class AuthorLink extends Component {
  getAuthorHref() {
    const { author, recordId } = this.props;
    let href = `//inspirehep.net/author/profile/${author.get('full_name')}`;
    if (recordId != null) {
      href = `${href}?recid=${recordId}`;
    }
    return href;
  }

  render() {
    const { author } = this.props;
    const affiliation = author.getIn(['affiliations', 0, 'value']);
    const href = this.getAuthorHref();
    // TODO add affiliation info tooltip!
    return (
      <Tooltip placement="bottom" title={affiliation}>
        <a target="_blank" href={href}>
          {author.get('full_name')}
        </a>
      </Tooltip>
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
