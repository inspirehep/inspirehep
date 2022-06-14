import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { Link } from 'react-router-dom';
import { getAuthorName, getRecordIdFromRef } from '../../utils';
import { AUTHORS } from '../../routes';

function LinkedAuthor({ author }) {
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
  author: PropTypes.instanceOf(Map).isRequired,
};

export default LinkedAuthor;
