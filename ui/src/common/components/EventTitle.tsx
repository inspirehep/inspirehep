import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';

import Latex from './Latex';

function EventTitle({ title, acronym }) {
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

EventTitle.propTypes = {
  acronym: PropTypes.string,
  title: PropTypes.instanceOf(Map).isRequired,
};

export default EventTitle;
