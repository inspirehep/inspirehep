import React from 'react';
import { Map } from 'immutable';
import { getAuthorName } from '../../utils';

function UnlinkedAuthor({ author }: { author: Map<string, string> }) {
  return <span>{getAuthorName(author)}</span>;
}

export default UnlinkedAuthor;
