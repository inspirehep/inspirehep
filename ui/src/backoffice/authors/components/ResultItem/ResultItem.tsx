import React from 'react';
import { Row, Col, Card } from 'antd';
import { Link } from 'react-router-dom';

import './ResultItem.less';
import ResultItem from '../../../../common/components/ResultItem';
import UnclickableTag from '../../../../common/components/UnclickableTag';
import { BACKOFFICE } from '../../../../common/routes';
import { getWorkflowStatusInfo, resolveDecision } from '../../../utils/utils';


const renderWorkflowStatus = (status: string) => {
  const statusInfo = getWorkflowStatusInfo(status);
  return statusInfo ? (
    <div>
      <p className={`b ${status.toLowerCase()} mt3`}>
        {statusInfo.icon} {statusInfo.text}
      </p>
      <br />
      <small>{statusInfo.description}</small>
    </div>
  ) : null;
};

const WorkflowResultItem = ({ item }: { item: any }) => {
  const data = item?.get('data');
  const decision = item?.get('decisions')?.first();

  return (
    <div className="result-item result-item-action mv2">
      <Row justify="start" wrap={false}>

        <Col className="col-details">
          <ResultItem>
            <Link
              className="result-item-title"
              to={`${BACKOFFICE}/${item.get('id')}`}
              target="_blank"
            >
              <div className="flex">
                <div style={{ marginTop: '-2px' }}>
                  <UnclickableTag>Author</UnclickableTag>
                  {item?.get('workflow_type') === 'AUTHOR_UPDATE' && (
                    <>
                      {' '}
                      <UnclickableTag color="processing">Update</UnclickableTag>
                    </>
                  )}
                  {decision && (
                    <UnclickableTag
                      className={`decission-pill ${resolveDecision(
                        decision?.get('action')
                      )?.bg}`}
                    >
                      {resolveDecision(decision?.get('action'))?.text}
                    </UnclickableTag>
                  )}
                </div>
                <span className="dib ml2">
                  {data?.getIn(['name', 'value'])}
                </span>
              </div>
            </Link>
          </ResultItem>
        </Col>
        <Col className="col-actions">
          <Card>{renderWorkflowStatus(item?.get('status'))}</Card>
        </Col>
        <Col className="col-info">
          <Card>
            <p className="waiting">
              {new Date(
                data?.getIn(['acquisition_source', 'datetime'])
              ).toLocaleDateString()}
            </p>
            <p className="waiting">
              {data?.getIn(['acquisition_source', 'source'])}
            </p>
            <p className="waiting mb0">
              {data?.getIn(['acquisition_source', 'email'])}
            </p>
          </Card>
        </Col>
        <Col className="col-subject">
          <Card>
            {data?.get('arxiv_categories')?.map((category: string) => (
              <div className="mb2" key={category}>
                <UnclickableTag color="blue">{category}</UnclickableTag>
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default WorkflowResultItem;
