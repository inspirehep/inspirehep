import React from 'react';
import { Map } from 'immutable';

import { getAuthorDisplayName } from '../utils';

const AuthorName = ({ name }: { name: Map<string, string> }) => {
  const nativeName = name.getIn(['native_names', 0]);
  const displayName = getAuthorDisplayName(name);

  return (
    <span>
      {displayName}
      {nativeName && <span> ({nativeName})</span>}
    </span>
  );
};

export default AuthorName;
