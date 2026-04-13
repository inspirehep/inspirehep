import React from 'react';
import { Card } from 'antd';
import { Link } from 'react-router-dom';

import { COLLECTIONS, getIcon } from '../../utils/utils';
import {
  BACKOFFICE_AUTHORS_SEARCH,
  BACKOFFICE_LITERATURE_SEARCH,
} from '../../../common/routes';
import {
  WorkflowCardProps,
  WorkflowStatuses,
  WORKFLOW_STATUS_ORDER,
} from '../../constants';

const WorkflowCard = ({ type, statuses }: WorkflowCardProps) => {
  const workflowTypeKey = type?.get('key');
  const docCount = type?.get('doc_count') || 0;
  const collection = COLLECTIONS.find((col) => col?.value === workflowTypeKey);
  const getStatusPosition = (status: string) => {
    const position = WORKFLOW_STATUS_ORDER.indexOf(status as WorkflowStatuses);
    return position === -1 ? Number.MAX_SAFE_INTEGER : position;
  };
  const sortedStatuses = statuses.sortBy((status) =>
    getStatusPosition(status?.get('key'))
  );

  const getSearchRoute = () => {
    return workflowTypeKey?.includes('AUTHOR')
      ? BACKOFFICE_AUTHORS_SEARCH
      : BACKOFFICE_LITERATURE_SEARCH;
  };

  const baseUrl = `${getSearchRoute()}?workflow_type=${workflowTypeKey}`;

  if (!workflowTypeKey || !collection) {
    return null;
  }

  return (
    <Card
      title={
        <div>
          <p>{collection.key}</p>
          <p className="f2 mb0 black">{docCount}</p>
          <Link to={baseUrl} className="normal f6">
            View all
          </Link>
        </div>
      }
      headStyle={{ textAlign: 'center' }}
      className={collection.key.toLowerCase().replace(/ /g, '-')}
      key={workflowTypeKey}
    >
      {sortedStatuses.map((status) => {
        const statusKey = status?.get('key');
        const statusCount = status?.get('doc_count') || 0;

        if (!statusKey) return null;

        const statusKeyText = statusKey.replace(/_/g, ' ');

        return (
          <Link
            key={statusKey}
            to={`${baseUrl}&status=${statusKey}`}
            className="db no-underline"
          >
            <div className={`flex justify-between ${statusKey.toLowerCase()}`}>
              <p className="ttc">
                {getIcon(statusKey)}
                {statusKeyText}
              </p>
              <span className="b">{statusCount}</span>
            </div>
          </Link>
        );
      })}
    </Card>
  );
};

export default WorkflowCard;
