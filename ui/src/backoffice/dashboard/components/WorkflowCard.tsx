import { Card } from 'antd';
import { Link } from 'react-router-dom';

import { List, Map } from 'immutable';
import { COLLECTIONS } from '../../utils/utils';
import {
  BACKOFFICE_AUTHORS_SEARCH,
  BACKOFFICE_LITERATURE_SEARCH,
} from '../../../common/routes';
import {
  WorkflowStatuses,
  WorkflowStatusGroups,
  WORKFLOW_STATUS_ORDER,
  WORKFLOW_STATUS_TO_STATUS_GROUP,
  STATUS_GROUPS_CONFIG,
} from '../../constants';
import StatusGroup from './StatusGroup';

interface WorkflowCardProps {
  type: Map<string, any>;
  statuses: List<Map<string, any>>;
  collapseMap: Map<string, boolean>;
  onGroupCollapseStateChange: (key: string, isOpen: boolean) => void;
}

const WorkflowCard = ({
  type,
  statuses,
  collapseMap,
  onGroupCollapseStateChange,
}: WorkflowCardProps) => {
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
      bodyStyle={{ paddingRight: '10px', paddingLeft: '10px' }}
    >
      {Object.keys(STATUS_GROUPS_CONFIG).map((statusGroup) => {
        const statusesFromGroup = statusesByGroup[statusGroup];
        if (statusesFromGroup !== undefined && statusesFromGroup.length > 0) {
          const groupKey = `${collection.key}-${statusGroup}`;
          return (
            <StatusGroup
              key={groupKey}
              groupKey={groupKey}
              groupStatusKey={statusGroup as WorkflowStatusGroups}
              statuses={statusesFromGroup}
              baseUrl={baseUrl}
              isOpen={collapseMap.get(groupKey) ?? false}
              onGroupCollapseStateChange={onGroupCollapseStateChange}
            />
          );
        }
        return null;
      })}
    </Card>
  );
};

export default WorkflowCard;
