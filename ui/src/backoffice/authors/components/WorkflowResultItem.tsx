import React from 'react';
import { Map } from 'immutable';
import { Row, Col, Card } from 'antd';

import '../../common/components/ResultItem/ResultItem.less';
import { Link } from 'react-router-dom';
import { formatDateTime, getWorkflowStatusInfo } from '../../utils/utils';
import { WORKFLOW_TYPES } from '../../constants';
import {
  AUTHORS_PID_TYPE,
  LITERATURE_PID_TYPE,
} from '../../../common/constants';
import ResultItem from '../../../common/components/ResultItem';
import { BACKOFFICE } from '../../../common/routes';
import AcquisitionSourceInfo from '../../common/components/AcquisitionSourceInfo/AcquisitionSourceInfo';
import AuthorSubjectAreas from './AuthorSubjectAreas';
import AuthorResultItem from './AuthorResultItem';

const WorkflowResultItem = ({ item }: { item: any }) => {
  const workflowId = item?.get('id');
  const data = item?.get('data');
  const dateTime = data?.getIn(['acquisition_source', 'datetime']);
  const acquisitionSourceDatetime = formatDateTime(dateTime);
  const acquisitionSourceSource = data?.getIn(['acquisition_source', 'source']);
  const acquisitionSourceEmail = data?.getIn(['acquisition_source', 'email']);
  const subjectAreas = data?.get('arxiv_categories');

  const status = item?.get('status');
  const statusInfo = getWorkflowStatusInfo(status);

  return (
    <div className="result-item result-item-action mv2">
      <Row justify="start" wrap={false}>
        <Col className="col-details">
          <ResultItem>
            <Link
              className="result-item-title"
              to={`${BACKOFFICE}/${AUTHORS_PID_TYPE}/${workflowId}`}
              target="_blank"
            >
              <AuthorResultItem item={item} />
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
            <AuthorSubjectAreas categories={subjectAreas} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default WorkflowResultItem;
