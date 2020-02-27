import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { getAuthorName } from '../../utils';

function UnlinkedAuthor({ author }) {
  return <span>{getAuthorName(author)}</span>;
}

UnlinkedAuthor.propTypes = {
  author: PropTypes.instanceOf(Map).isRequired,
};

export default UnlinkedAuthor;
