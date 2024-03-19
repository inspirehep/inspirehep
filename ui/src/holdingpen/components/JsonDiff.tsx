import React from 'react';
import { diff, formatters } from 'jsondiffpatch';

import 'jsondiffpatch/dist/formatters-styles/html.css';

const JsonDiff = ({
  first,
  second,
}: {
  first: Record<any, any>;
  second: Record<any, any>;
}) => {
  const delta = diff(first, second);
  return (
    <div
      /* eslint-disable-next-line react/no-danger */
      dangerouslySetInnerHTML={{
        __html: formatters.html.format(delta!, second),
      }}
    />
  );
};

export default JsonDiff;
