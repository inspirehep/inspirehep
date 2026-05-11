import { Map } from 'immutable';
import { useEffect, useState } from 'react';
import { CaretDownOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import storage from '../../../common/storage';
import './StatusGroup.less';

interface StatusGroupProps {
  label: string;
  groupKey: string;
  groupStatusKey: string;
  statuses: Map<string, any>[];
  baseUrl: string;
  isCollapsable: boolean;
}

const StatusGroup = ({
  label,
  groupKey,
  groupStatusKey,
  statuses,
  baseUrl,
  isCollapsable,
}: StatusGroupProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(
    storage.getSync(groupKey) ?? false
  );
  const sumOfStatuses = statuses.reduce((accumulator, currentValue) => {
    return accumulator + (currentValue.get('doc_count') || 0);
  }, 0);

  useEffect(() => {
    storage.set(groupKey, isOpen);
  }, [groupKey, isOpen]);

  const headerContent = (
    <div className="flex items-center justify-between w-100">
      <div className="flex items-center fw6" style={{ gap: 10 }}>
        <div className={`br-100 bg-${groupStatusKey}`} />
        {label}{' '}
        {isCollapsable && <CaretDownOutlined rotate={isOpen ? 0 : -90} />}
      </div>
      <div className="b">{sumOfStatuses}</div>
    </div>
  );

  return (
    <div className="__StatusGroup__">
      {isCollapsable ? (
        <Button
          type="text"
          onClick={() => setIsOpen(!isOpen)}
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
              <div
                className="flex justify-between status-link"
                style={{ paddingLeft: 34 }}
              >
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
