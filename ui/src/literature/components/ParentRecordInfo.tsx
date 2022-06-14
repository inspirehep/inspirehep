import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { Link } from 'react-router-dom';
import { getRecordIdFromRef } from '../../common/utils';
import { LITERATURE } from '../../common/routes';

function ParentRecordInfo({ parentRecord, publicationInfo }) {
  const pageStart = publicationInfo
    ? publicationInfo.get(0, {}).get('page_start')
    : null;
  const pageEnd = publicationInfo
    ? publicationInfo.get(0, {}).get('page_end')
    : null;
  return (
    <div>
      <span>Part of </span>
      <Link
        to={`${LITERATURE}/${getRecordIdFromRef(
          parentRecord.getIn(['record', '$ref'])
        )}`}
      >
        {parentRecord.get('title')}
        {parentRecord.has('subtitle') && (
          <span> : {parentRecord.get('subtitle')}</span>
        )}
      </Link>
      {pageStart && pageEnd && (
        <span>
          , {pageStart}-{pageEnd}
        </span>
      )}
    </div>
  );
}

ParentRecordInfo.propTypes = {
  parentRecord: PropTypes.instanceOf(Map).isRequired,
};

export default ParentRecordInfo;
