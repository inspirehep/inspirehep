import React from 'react';
import { Row, Col, Card } from 'antd';

import './ResultItem.less';
import { Link } from 'react-router-dom';
import UnclickableTag from '../../../../common/components/UnclickableTag';
import { getWorkflowStatusInfo, formatDateTime } from '../../../utils/utils';
import { WORKFLOW_TYPES } from '../../../constants';
import {
  AUTHORS_PID_TYPE,
  LITERATURE_PID_TYPE,
} from '../../../../common/constants';
import ResultItem from '../../../../common/components/ResultItem';
import { BACKOFFICE } from '../../../../common/routes';
import AuthorResultItem from '../../../authors/components/AuthorResultItem';
import LiteratureResultItem from '../../../literature/components/LiteratureResultItem';

const renderWorkflowStatus = (status: string) => {
  const statusInfo = getWorkflowStatusInfo(status);
  if (!statusInfo) {
    return null;
  }
  return (
    <div>
      <p className={`b ${status.toLowerCase()} mt3`}>
        {statusInfo.icon} {statusInfo.text}
      </p>
      <br />
      <small>{statusInfo.description}</small>
    </div>
  );
};

const ResultItemComponent = ({ item, type }: { item: any; type: string }) => {
  switch (type) {
    case AUTHORS_PID_TYPE:
      return <AuthorResultItem item={item} />;
    case LITERATURE_PID_TYPE:
      return <LiteratureResultItem item={item} />;
    default:
      return null;
  }
};

const WorkflowResultItem = ({ item }: { item: any }) => {
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

  return (
    <div className="result-item result-item-action mv2">
      <Row justify="start" wrap={false}>
        <Col className="col-details">
          <ResultItem>
            <Link
              className="result-item-title"
              to={`${BACKOFFICE}/${workflowTypeToPidType}/${workflowId}`}
              target="_blank"
            >
              <ResultItemComponent item={item} type={workflowTypeToPidType} />
            </Link>
          </ResultItem>
        </Col>
        <Col className="col-actions">
          <Card>{renderWorkflowStatus(item?.get('status'))}</Card>
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
            {data?.get('arxiv_categories')?.map((category: string) => (
              <div className="mb2" key={category}>
                <UnclickableTag color="blue">{category}</UnclickableTag>
              </div>
            ))}
            {data
              ?.get('inspire_categories')
              ?.map((category: Map<string, any>) => (
                <div className="mb2" key={category.get('term')}>
                  <UnclickableTag color="blue">
                    {category.get('term')}
                  </UnclickableTag>
                </div>
              ))}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default WorkflowResultItem;
