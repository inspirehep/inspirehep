import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Link } from 'react-router-dom';
import { getRecordIdFromRef } from '../../common/utils';
import { LITERATURE } from '../../common/routes';

function ParentRecordInfo({
  parentRecord,
  publicationInfo
}: any) {
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
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof Map' is not assignable to... Remove this comment to see the full error message
  parentRecord: PropTypes.instanceOf(Map).isRequired,
};

export default ParentRecordInfo;
