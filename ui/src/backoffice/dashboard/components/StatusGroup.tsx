import { Map } from 'immutable';
import { CaretDownOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import './StatusGroup.less';
import { STATUS_GROUPS_CONFIG, WorkflowStatusGroups } from '../../constants';

interface StatusGroupProps {
  groupKey: string;
  groupStatusKey: WorkflowStatusGroups;
  statuses: Map<string, any>[];
  baseUrl: string;
  isOpen: boolean;
  onGroupCollapseStateChange: (key: string, isOpen: boolean) => void;
}

const StatusGroup = ({
  groupKey,
  groupStatusKey,
  statuses,
  baseUrl,
  isOpen,
  onGroupCollapseStateChange,
}: StatusGroupProps) => {
  const { label, isCollapsable } = STATUS_GROUPS_CONFIG[groupStatusKey];
  const sumOfStatuses = statuses.reduce((accumulator, currentValue) => {
    return accumulator + (currentValue.get('doc_count') || 0);
  }, 0);

  const handleClick = () => {
    const newValue = !isOpen;
    onGroupCollapseStateChange(groupKey, newValue);
  };

  const headerContent = (
    <div className="flex items-center justify-between w-100">
      <div className="flex items-center fw6" style={{ gap: '10px' }}>
        <div className={`br-100 bg-${groupStatusKey}`} />
        {label}
      </div>
      <div className="b flex items-center" style={{ gap: '8px' }}>
        {sumOfStatuses}{' '}
        {isCollapsable ? (
          <CaretDownOutlined rotate={isOpen ? 0 : -90} />
        ) : (
          <span aria-hidden="true" style={{ width: '14px' }} />
        )}
      </div>
    </div>
  );

  return (
    <div className="__StatusGroup__">
      {isCollapsable ? (
        <Button
          type="text"
          onClick={handleClick}
          block
          data-testid={`collapse-button-${groupKey}`}
        >
          {headerContent}
        </Button>
      ) : (
        <Link
          to={`${baseUrl}&status=${groupStatusKey}`}
          className="ant-btn ant-btn-text ant-btn-block no-underline"
        >
          {headerContent}
        </Link>
      )}
      {isCollapsable &&
        isOpen &&
        statuses.map((status) => {
          const statusKey = status.get('key');
          const statusCount = status.get('doc_count') || 0;

          if (!statusKey) return null;

          const statusKeyText = statusKey.replaceAll('_', ' ');

          return (
            <Link
              key={statusKey}
              to={`${baseUrl}&status=${statusKey}`}
              className="no-underline"
              data-testid={`view-${groupKey}-${statusKey}`}
            >
              <div className="flex justify-between status-link ">
                <p className="ttc" style={{ marginBottom: 0 }}>
                  {statusKeyText}
                </p>
                <span>{statusCount}</span>
              </div>
            </Link>
          );
        })}
    </div>
  );
};

export default StatusGroup;
