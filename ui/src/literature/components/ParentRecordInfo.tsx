import React from 'react';
import { Map } from 'immutable';
import { Link } from 'react-router-dom';

import { getRecordIdFromRef } from '../../common/utils';
import { LITERATURE } from '../../common/routes';

interface ParentRecordInfoProps {
  parentRecord: Map<string, any>;
}

const renderBook = (data: Map<string, any>): JSX.Element[] =>
  data
    .entrySeq()
    .map(([key, item]: [string, Map<string, any>], index: number) => (
      <React.Fragment key={item.get('title')}>
        <Link
          to={`${LITERATURE}/${getRecordIdFromRef(
            item.getIn(['record', '$ref'])
          )}`}
        >
          {item.get('title')}
          {item.get('subtitle') && <span> : {item.get('subtitle')}</span>}
        </Link>
        {(item.has('page_start') || item.has('page_end')) && (
          <span>
            , {item.get('page_start') || ''}
            {item.get('page_start') && item.get('page_end') ? '-' : ''}
            {item.get('page_end') || ''}
          </span>
        )}
        {index < data.size - 1 && <span>, </span>}
      </React.Fragment>
    ))
    .toArray();

const ParentRecordInfo: React.FC<ParentRecordInfoProps> = ({
  parentRecord,
}) => (
  <div>
    <span>Part of </span>
    {renderBook(parentRecord)}
  </div>
);

export default ParentRecordInfo;
