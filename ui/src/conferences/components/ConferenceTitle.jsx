import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';

function ConferenceTitle({ title, acronym }) {
  const mainTitle = title.get('title');
  const subTitle = title.get('subtitle');
  return (
    <span>
      {mainTitle}
      {subTitle && (
        <span>
          <span> : </span>
          {subTitle}
        </span>
      )}
      {acronym && <span> ({acronym})</span>}
    </span>
  );
}

ConferenceTitle.propTypes = {
  acronym: PropTypes.string,
  title: PropTypes.instanceOf(Map).isRequired,
};

export default ConferenceTitle;
