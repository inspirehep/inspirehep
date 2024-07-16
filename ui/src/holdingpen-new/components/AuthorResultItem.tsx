/* eslint-disable no-underscore-dangle */
import React from 'react';
import {
  CheckOutlined,
  LoadingOutlined,
  StopOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Row, Col, Card } from 'antd';
import { Link } from 'react-router-dom';

import './ResultItem.less';
import PublicationSelectContainer from '../../authors/containers/PublicationSelectContainer';
import ResultItem from '../../common/components/ResultItem';
import UnclickableTag from '../../common/components/UnclickableTag';
import { HOLDINGPEN_NEW } from '../../common/routes';

const resolveDecision = (decision: string | number) => {
  const decisions: { [key: string]: { bg: string; text: string } } = {
    accept: { bg: 'bg-halted ml1', text: 'Accept' },
    accept_curate: { bg: 'bg-halted ml1', text: 'Accept Curate' },
    reject: { bg: 'bg-error font-white', text: 'Reject' },
  };
  return decisions[decision] || null;
};

const renderWorkflowStatus = (status: string) => {
  const statuses: {
    [key: string]: { icon: JSX.Element; text: string; description: string };
  } = {
    completed: {
      icon: <CheckOutlined className="mr2" />,
      text: 'Completed',
      description: 'This workflow has been completed.',
    },
    approval: {
      icon: <StopOutlined className="mr2" />,
      text: 'Waiting for approval',
      description: 'This workflow has been halted until decision is made.',
    },
    error: {
      icon: <WarningOutlined className="mr2" />,
      text: 'Error',
      description:
        'This record is in error state. View record details for more information.',
    },
    running: {
      icon: <LoadingOutlined className="mr2" />,
      text: 'Running',
      description:
        'This workflow is currently running. Please wait for it to complete.',
    },
  };

  const statusInfo = statuses[status];
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

const AuthorResultItem = ({ item }: { item: any }) => {
  const data = item?.get('data');

  return (
    <div className="result-item result-item-action mv2">
      <Row justify="start" wrap={false}>
        <Col className="col-pub-select">
          <PublicationSelectContainer
            claimed={false}
            disabled={false}
            isOwnProfile={false}
            recordId={item.get('id')}
          />
        </Col>
        <Col className="col-details">
          <ResultItem>
            <Link
              className="result-item-title"
              to={`${HOLDINGPEN_NEW}/${item.get('id')}`}
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
                  {item?.get('user_action') && (
                    <UnclickableTag
                      className={`decission-pill ${resolveDecision(
                        item?.get('user_action')
                      )?.bg}`}
                    >
                      {resolveDecision(item?.get('user_action'))?.text}
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

export default AuthorResultItem;
