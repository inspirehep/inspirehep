import React from 'react';
import { Map } from 'immutable';
import { Row, Col, Card, Checkbox } from 'antd';

import '../../common/components/ResultItem/ResultItem.less';
import { Link } from 'react-router-dom';
import { formatDateTime, getWorkflowStatusInfo } from '../../utils/utils';
import { LITERATURE_PID_TYPE } from '../../../common/constants';
import ResultItem from '../../../common/components/ResultItem';
import { BACKOFFICE } from '../../../common/routes';
import AcquisitionSourceInfo from '../../common/components/AcquisitionSourceInfo/AcquisitionSourceInfo';
import LiteratureActionButtons from './LiteratureActionButtons';
import LiteratureSubjectAreas from './LiteratureSubjectAreas';
import LiteratureResultItem from './LiteratureResultItem';

const WorkflowResultItem = ({
  item,
  compactBottom = false,
  handleResolveAction,
  actionInProgress,
  shouldShowSelectionCheckbox = false,
  isSelected = false,
  onSelectionChange,
}: {
  item: any;
  compactBottom?: boolean;
  handleResolveAction?: (action: string, value: string) => void;
  actionInProgress?: Map<string, any> | null;
  shouldShowSelectionCheckbox?: boolean;
  isSelected?: boolean;
  onSelectionChange?: (workflowId: string, checked: boolean) => void;
}) => {
  const workflowId = item?.get('id');
  const data = item?.get('data');
  const dateTime = data?.getIn(['acquisition_source', 'datetime']);
  const acquisitionSourceDatetime = formatDateTime(dateTime);
  const acquisitionSourceSource = data?.getIn(['acquisition_source', 'source']);
  const acquisitionSourceEmail = data?.getIn(['acquisition_source', 'email']);
  const subjectAreas = data?.get('inspire_categories');
  const inspireCategories = subjectAreas?.toJS();

  const hasInspireCategories =
    Array.isArray(inspireCategories) && inspireCategories.length > 0;
  const status = item?.get('status');
  const statusInfo = getWorkflowStatusInfo(status);

  return (
    <div
      className="result-item result-item-action mv2"
      style={compactBottom ? { marginBottom: 0 } : undefined}
    >
      <Row justify="start" wrap={false}>
        {shouldShowSelectionCheckbox && (
          <Col className="col-checkbox">
            <Checkbox
              checked={isSelected}
              onChange={(event) =>
                onSelectionChange?.(workflowId, event.target.checked)
              }
              aria-label={`Select workflow ${workflowId}`}
            />
          </Col>
        )}
        <Col className="col-details">
          <ResultItem>
            <Link
              className="result-item-title"
              to={`${BACKOFFICE}/${LITERATURE_PID_TYPE}/${workflowId}`}
              target="_blank"
            >
              <LiteratureResultItem item={item} />
            </Link>
          </ResultItem>
        </Col>
        <Col className="col-actions">
          <Card>
            {statusInfo && (
              <div>
                <p className={`b ${status.toLowerCase()} mt3`}>
                  {statusInfo.icon} {statusInfo.text}
                </p>
                <LiteratureActionButtons
                  status={status}
                  hasInspireCategories={hasInspireCategories}
                  handleResolveAction={handleResolveAction}
                  actionInProgress={actionInProgress}
                  workflowId={workflowId}
                />
                <br />
                <small>{statusInfo.description}</small>
              </div>
            )}
          </Card>
        </Col>
        <Col className="col-info">
          <Card>
            <AcquisitionSourceInfo
              datetime={acquisitionSourceDatetime}
              source={acquisitionSourceSource}
              email={acquisitionSourceEmail}
            />
          </Card>
        </Col>
        <Col className="col-subject">
          <Card>
            <LiteratureSubjectAreas categories={subjectAreas} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default WorkflowResultItem;
