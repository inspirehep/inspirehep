import React from 'react';
import { Map } from 'immutable';
import { Link } from 'react-router-dom';

import { getAuthorName, getRecordIdFromRef } from '../../utils';
import { AUTHORS } from '../../routes';

function LinkedAuthor({ author }: { author: Map<string, string> }) {
  return (
    <Link
      data-test-id="author-link"
      to={`${AUTHORS}/${getRecordIdFromRef(author.getIn(['record', '$ref']) as string)}`}
    >
      {getAuthorName(author)}
    </Link>
  );
}

export default LinkedAuthor;
