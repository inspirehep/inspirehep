import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Set } from 'immutable';

import { doSetsHaveCommonItem } from './../utils';

export default class Logo extends Component {
  render() {
    const { userRoles, authorizedRoles, src } = this.props;
    const isAuthorized = doSetsHaveCommonItem(userRoles, authorizedRoles);

    if (isAuthorized) {
      return (
        <Link to="/">
          <img src={src} alt="INSPIRE Labs" />
        </Link>
      );
    }
    return (
      <a href="/" title="INSPIRE Labs">
        <img src={src} alt="INSPIRE Labs" />
      </a>
    );
  }
}

Logo.propTypes = {
  src: PropTypes.string.isRequired,
  userRoles: PropTypes.instanceOf(Set).isRequired,
  authorizedRoles: PropTypes.instanceOf(Set),
};

Logo.defaultProps = {
  authorizedRoles: null,
};
