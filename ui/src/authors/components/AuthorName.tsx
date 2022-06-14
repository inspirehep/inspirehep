import React, { Component } from 'react';
import { Map } from 'immutable';
import { getAuthorDisplayName } from '../utils';

type Props = {
    name: $TSFixMe; // TODO: PropTypes.instanceOf(Map)
};

class AuthorName extends Component<Props> {

  render() {
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

export default AuthorName;
