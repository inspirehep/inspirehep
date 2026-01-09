import React from 'react';
import { Row, Col, Card } from 'antd';

import './ResultItem.less';
import { Link } from 'react-router-dom';
import { formatDateTime } from '../../../utils/utils';
import { WORKFLOW_TYPES } from '../../../constants';
import { AUTHORS_PID_TYPE } from '../../../../common/constants';
import ResultItem from '../../../../common/components/ResultItem';
import { BACKOFFICE } from '../../../../common/routes';
import ResultItemByType from './ResultItemByType';
import SubjectAreasByType from './SubjectAreasByType';
import WorkflowStatusByType from './WorkflowStatusByType';

const WorkflowResultItem = ({
  item,
  compactBottom = false,
}: {
  item: any;
  compactBottom?: boolean;
}) => {
  const workflowId = item?.get('id');
  const data = item?.get('data');
  const dateTime = data?.getIn(['acquisition_source', 'datetime']);
  const acquisitionSourceDatetime = formatDateTime(dateTime);
  const acquisitionSourceSource = data?.getIn(['acquisition_source', 'source']);
  const acquisitionSourceEmail = data?.getIn(['acquisition_source', 'email']);
  const workflowTypeKey = item?.get(
    'workflow_type'
  ) as keyof typeof WORKFLOW_TYPES;
  const workflowTypeToPidType = WORKFLOW_TYPES[workflowTypeKey];
  const subjectAreas =
    workflowTypeToPidType === AUTHORS_PID_TYPE
      ? data?.get('arxiv_categories')
      : data?.get('inspire_categories');

  return (
    <div
      className="result-item result-item-action mv2"
      style={compactBottom ? { marginBottom: 0 } : undefined}
    >
      <Row justify="start" wrap={false}>
        <Col className="col-details">
          <ResultItem>
            <Link
              className="result-item-title"
              to={`${BACKOFFICE}/${workflowTypeToPidType}/${workflowId}`}
              target="_blank"
            >
              <ResultItemByType item={item} type={workflowTypeToPidType} />
            </Link>
          </ResultItem>
        </Col>
        <Col className="col-actions">
          <Card>
            <WorkflowStatusByType
              status={item?.get('status')}
              type={workflowTypeToPidType}
            />
          </Card>
        </Col>
        <Col className="col-info">
          <Card>
            {acquisitionSourceDatetime && (
              <p className="waiting">
                {acquisitionSourceDatetime.date} at{' '}
                {acquisitionSourceDatetime.time}
              </p>
            )}
            {acquisitionSourceSource && (
              <p className="waiting">{acquisitionSourceSource}</p>
            )}
            {acquisitionSourceEmail && (
              <p className="waiting mb0">{acquisitionSourceEmail}</p>
            )}
          </Card>
        </Col>
        <Col className="col-subject">
          <Card>
            <SubjectAreasByType
              categories={subjectAreas}
              type={workflowTypeToPidType}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default WorkflowResultItem;
