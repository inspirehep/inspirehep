import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { getAuthorDisplayName } from '../utils';

class AuthorName extends Component {
  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'name' does not exist on type 'Readonly<{... Remove this comment to see the full error message
    const { name } = this.props;
    const nativeName = name.getIn(['native_names', 0]);
    const displayName = getAuthorDisplayName(name);

    return (
      <span>
        {displayName}
        {nativeName && <span> ({nativeName})</span>}
      </span>
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
AuthorName.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof Map' is not assignable to... Remove this comment to see the full error message
  name: PropTypes.instanceOf(Map).isRequired,
};

export default AuthorName;
