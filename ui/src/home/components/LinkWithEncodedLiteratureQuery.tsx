import React from 'react';
import { Link } from 'react-router-dom';

import { LITERATURE } from '../../common/routes';

function LinkWithEncodedLiteratureQuery({ query }: { query: string }) {
  return (
    <Link to={`${LITERATURE}?q=${encodeURIComponent(query)}`}>{query}</Link>
  );
}

export default LinkWithEncodedLiteratureQuery;
