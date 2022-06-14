import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { getAuthorName } from '../../utils';

function UnlinkedAuthor({
  author
}: any) {
  return <span>{getAuthorName(author)}</span>;
}

UnlinkedAuthor.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof Map' is not assignable to... Remove this comment to see the full error message
  author: PropTypes.instanceOf(Map).isRequired,
};

export default UnlinkedAuthor;
