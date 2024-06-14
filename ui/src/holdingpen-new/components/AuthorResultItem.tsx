/* eslint-disable no-underscore-dangle */
import React from 'react';
import { CheckOutlined, StopOutlined } from '@ant-design/icons';
import { Row, Col, Card } from 'antd';
import { Link } from 'react-router-dom';

import './ResultItem.less';
import PublicationSelectContainer from '../../authors/containers/PublicationSelectContainer';
import ResultItem from '../../common/components/ResultItem';
import UnclickableTag from '../../common/components/UnclickableTag';
import { HOLDINGPEN_NEW } from '../../common/routes';

const AuthorResultItem = ({ item }: { item: any }) => {
  const workflow = item?._workflow;
  const metadata = item?.metadata;
  const extraData = item?._extra_data;

  const resolveDecision = (decision: string) => {
    if (decision === 'accept') {
      return { bg: 'bg-halted ml1', text: 'Accept' };
    }
    if (decision === 'accept_curate') {
      return { bg: 'bg-halted ml1', text: 'Accept Curate' };
    }
    if (decision === 'reject') {
      return { bg: 'bg-error font-white', text: 'Reject' };
    }

    return null;
  };

  return (
    <div key={item?.id} className="result-item result-item-action mv2">
      <Row justify="start" wrap={false}>
        <Col className="col-pub-select">
          <PublicationSelectContainer
            claimed={false}
            disabled={false}
            isOwnProfile={false}
            recordId={item?.id}
          />
        </Col>
        <Col className="col-details">
          <ResultItem>
            <Link
              className="result-item-title"
              to={`${HOLDINGPEN_NEW}/author/${item?.id}`}
              target="_blank"
            >
              <div className="flex">
                <div style={{ marginTop: '-2px' }}>
                  <UnclickableTag>Author</UnclickableTag>
                  {extraData?.user_action && (
                    <UnclickableTag
                      className={`decission-pill ${resolveDecision(
                        extraData?.user_action
                      )?.bg}`}
                    >
                      {resolveDecision(extraData?.user_action)?.text}
                    </UnclickableTag>
                  )}
                </div>
                <span className="dib ml2">{metadata?.name?.value}</span>
              </div>
            </Link>
          </ResultItem>
        </Col>
        <Col className="col-actions">
          <Card>
            {workflow?.status === 'COMPLETED' && (
              <div>
                <p className="b completed mt3">
                  <CheckOutlined className="mr2" /> Completed
                </p>
                <br />
                <small>This workflow has been completed.</small>
              </div>
            )}
            {workflow?.status === 'HALTED' && (
              <div>
                <p className="b halted mt3">
                  <StopOutlined className="mr2" /> Halted
                </p>
                <br />
                <small>
                  This workflow has been halted until decision is made.
                </small>
              </div>
            )}
          </Card>
        </Col>
        <Col className="col-info">
          <Card>
            <p className="waiting">
              {new Date(
                metadata?.acquisition_source?.datetime
              ).toLocaleDateString()}
            </p>
            <p className="waiting">{metadata?.acquisition_source?.source}</p>
            <p className="waiting mb0">{metadata?.acquisition_source?.email}</p>
          </Card>
        </Col>
        <Col className="col-subject">
          <Card>
            {metadata?.arxiv_categories?.map((category: string) => (
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
