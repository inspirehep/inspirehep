import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { Link } from 'react-router-dom';
import { getRecordIdFromRef } from '../../common/utils';
import { LITERATURE } from '../../common/routes';

function ParentRecordLink({ parentRecord }) {
  return (
    <div>
      <span>Part of </span>
      <Link
        to={`${LITERATURE}/${getRecordIdFromRef(
          parentRecord.getIn(['record', '$ref'])
        )}`}
      >
        {parentRecord.get('title')}
      </Link>
    </div>
  );
}

ParentRecordLink.propTypes = {
  parentRecord: PropTypes.instanceOf(Map).isRequired,
};

export default ParentRecordLink;
