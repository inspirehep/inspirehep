import React from 'react';
import { Map } from 'immutable';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Link } from 'react-router-dom';
import { getAuthorName, getRecordIdFromRef } from '../../utils';
import { AUTHORS } from '../../routes';

type Props = {
    author: $TSFixMe; // TODO: PropTypes.instanceOf(Map)
};

function LinkedAuthor({ author }: Props) {
  return (
    <Link
      data-test-id="author-link"
      to={`${AUTHORS}/${getRecordIdFromRef(author.getIn(['record', '$ref']))}`}
    >
      {getAuthorName(author)}
    </Link>
  );
}

export default LinkedAuthor;
