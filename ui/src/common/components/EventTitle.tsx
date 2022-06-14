import React from 'react';
import { Map } from 'immutable';

import Latex from './Latex';

type Props = {
    acronym?: string;
    title: $TSFixMe; // TODO: PropTypes.instanceOf(Map)
};

function EventTitle({ title, acronym }: Props) {
  const mainTitle = title.get('title');
  const subTitle = title.get('subtitle');
  return (
    <span>
      <Latex>{mainTitle}</Latex>
      {subTitle && (
        <span>
          <span> : </span>
          <Latex>{subTitle}</Latex>
        </span>
      )}
      {acronym && <span> ({acronym})</span>}
    </span>
  );
}

export default EventTitle;
