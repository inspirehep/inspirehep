import React from 'react';
import { Map } from 'immutable';
import { getAuthorName } from '../../utils';

type Props = {
    author: $TSFixMe; // TODO: PropTypes.instanceOf(Map)
};

function UnlinkedAuthor({ author }: Props) {
  return <span>{getAuthorName(author)}</span>;
}

export default UnlinkedAuthor;
