import React from 'react';
import { Map } from 'immutable';

import Latex from './Latex';

const LiteratureTitle = ({ title }: { title: Map<string, string> }) => (
  <span>
    <Latex>{title.get('title')}</Latex>
    {title.has('subtitle') && (
      <span>
        <span> : </span>
        <Latex>{title.get('subtitle')}</Latex>
      </span>
    )}
  </span>
);

export default LiteratureTitle;
