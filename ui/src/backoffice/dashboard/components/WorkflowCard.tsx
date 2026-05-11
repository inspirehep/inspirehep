import { Card } from 'antd';
import { Link } from 'react-router-dom';

import { COLLECTIONS } from '../../utils/utils';
import {
  BACKOFFICE_AUTHORS_SEARCH,
  BACKOFFICE_LITERATURE_SEARCH,
} from '../../../common/routes';
import {
  WorkflowCardProps,
  WorkflowStatuses,
  WORKFLOW_STATUS_ORDER,
  WORKFLOW_STATUS_TO_STATUS_GROUP,
  STATUS_GROUPS_CONFIG,
} from '../../constants';
import StatusGroup from './StatusGroup';

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

  const statusesByGroup = sortedStatuses.reduce(
    (acc, status) => {
      const workflowStatus = status.get('key') as WorkflowStatuses;

      const group = WORKFLOW_STATUS_TO_STATUS_GROUP[workflowStatus];

      if (!group) {
        return acc;
      }

      if (!acc[group]) {
        acc[group] = [];
      }

      acc[group]!.push(status);

      return acc;
    },
    {} as Record<string, any>
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
          <Link
            to={baseUrl}
            className="normal f6"
            data-testid={`view-all-${collection.key}`}
          >
            View all
          </Link>
        </div>
      }
      headStyle={{ textAlign: 'center' }}
      className={collection.key.toLowerCase().replace(/ /g, '-')}
      key={workflowTypeKey}
      data-testid={collection.key}
    >
      {Object.entries(STATUS_GROUPS_CONFIG).map(([statusGroup, config]) => {
        const statusesFromGroup = statusesByGroup[statusGroup];
        if (statusesFromGroup !== undefined && statusesFromGroup.length > 0) {
          return (
            <StatusGroup
              key={`${collection.key}-${statusGroup}`}
              label={config.label}
              groupKey={`${collection.key}-${statusGroup}`}
              groupStatusKey={statusGroup}
              statuses={statusesFromGroup}
              baseUrl={baseUrl}
              isCollapsable={config.isCollapsable}
            />
          );
        }
        return null;
      })}
    </Card>
  );
};

export default WorkflowCard;
