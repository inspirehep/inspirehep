import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Link } from 'react-router-dom';
import { getAuthorName, getRecordIdFromRef } from '../../utils';
import { AUTHORS } from '../../routes';

function LinkedAuthor({
  author
}: any) {
  return (
    <Link
      data-test-id="author-link"
      to={`${AUTHORS}/${getRecordIdFromRef(author.getIn(['record', '$ref']))}`}
    >
      {getAuthorName(author)}
    </Link>
  );
}

LinkedAuthor.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof Map' is not assignable to... Remove this comment to see the full error message
  author: PropTypes.instanceOf(Map).isRequired,
};

export default LinkedAuthor;
