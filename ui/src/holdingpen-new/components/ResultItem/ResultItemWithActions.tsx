import React from 'react';
import {
  CheckOutlined,
  WarningFilled,
  LoadingOutlined,
  FilePdfOutlined,
} from '@ant-design/icons';
import { Row, Col, Card, Button } from 'antd';
import { Link } from 'react-router-dom';

import './ResultItem.less';
import PublicationSelectContainer from '../../../authors/containers/PublicationSelectContainer';
import AuthorList from '../../../common/components/AuthorList';
import ResultItem from '../../../common/components/ResultItem';
import UnclickableTag from '../../../common/components/UnclickableTag';
import { HOLDINGPEN_NEW } from '../../../common/routes';

const ResultItemWithActions = ({ item }: { item: any }) => {
  const renderActions = (item: any) => {
    switch (item.get('status')) {
      case 'completed':
        return (
          <div>
            <p className="b completed mt3">
              <CheckOutlined /> Completed
            </p>

            <small>This workflow has been completed.</small>
          </div>
        );
      case 'awaiting decision':
        return (
          <div>
            <p>
              Automatic Decision:{' '}
              <span className="font-white bg-completed">CORE 0.62</span>
            </p>
            <div className="mb4">
              <Button className="font-white bg-completed mr1">Core</Button>
              <Button className="font-white bg-halted mr1">Accept</Button>
              <Button className="font-white bg-error">Reject</Button>
            </div>
            <small>
              <p>
                References: <b>0/43</b> core, <b>0/43</b> matched
              </p>
              <p className="halted">1 Filtered core keywords from fulltext </p>
              <span className="b">Sigma/b</span>
            </small>
          </div>
        );
      case 'error':
        return (
          <div>
            <p className="b error mt3">
              <WarningFilled /> Error
            </p>

            <small>
              This record is in error state. View record details for more
              information.
            </small>
          </div>
        );
      case 'preparing':
        return (
          <div>
            <p className="mt3 b">Preparing</p>
            <small>
              This record has not been run through the workflow yet. View the
              detailed record to start it.
            </small>
          </div>
        );
      case 'running':
        return (
          <div>
            <p className="b mt3">
              <LoadingOutlined className="mr1" />
              Running
            </p>
            <small>This record is being processed.</small>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div key={item.get('id')} className="result-item result-item-action mv2">
      <Row justify="start" wrap={false}>
        <Col className="col-pub-select">
          <PublicationSelectContainer
            claimed={false}
            disabled={false}
            isOwnProfile={false}
            recordId={0}
          />
        </Col>
        <Col className="col-details">
          <ResultItem>
            <Link
              className="result-item-title"
              to={`${HOLDINGPEN_NEW}/${item.get('id')}`}
              target="_blank"
            >
              {item.get('title')}
            </Link>
            <b>
              <AuthorList authors={item.get('authors')} />
            </b>
            <div className="mt1">{item.get('abstract')}</div>
            <br />
            <small>
              <b>e-Print:</b> 2404.15726
            </small>
            <br />
            <small>
              <b>Public notes:</b> Accepted at Robotics and Automation Magazine
              (RAM)
            </small>
            <br />
          </ResultItem>
        </Col>
        <Col className="col-actions">
          <Card>{renderActions(item)}</Card>
        </Col>
        <Col className="col-info">
          <Card>
            <p className="waiting">
              {new Date('2024-04-26T03:34:16.728144').toLocaleDateString()}
            </p>
            <p className="waiting">arXiv</p>
            <a className="db w-100" href="/">
              <FilePdfOutlined className="mr1" />
              PDF
            </a>
          </Card>
        </Col>
        <Col className="col-subject">
          <Card>
            <div className="mb2">
              <UnclickableTag color="blue">Computing</UnclickableTag>
            </div>
            <div className="mb2">
              <UnclickableTag color="blue">cs.CV</UnclickableTag>
            </div>
            <div className="mb2">
              <UnclickableTag color="blue">cs.AI</UnclickableTag>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ResultItemWithActions;
