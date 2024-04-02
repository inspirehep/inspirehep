import React from 'react';
import { CheckOutlined } from '@ant-design/icons';
import { Row, Col, Card } from 'antd';
import { Link } from 'react-router-dom';

import './ResultItem.less';
import PublicationSelectContainer from '../../authors/containers/PublicationSelectContainer';
import ResultItem from '../../common/components/ResultItem';
import UnclickableTag from '../../common/components/UnclickableTag';

const AuthorResultItem = ({ item }: { item: any }) => {
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
              to={`/holdingpen-new/author/${item.get('id')}`}
              target="_blank"
            >
              <div className="flex">
                <div style={{ marginTop: '-2px' }}>
                  <UnclickableTag>Author</UnclickableTag>
                </div>
                <span className="dib ml2">{item.get('display_name')}</span>
              </div>
            </Link>
          </ResultItem>
        </Col>
        <Col className="col-actions">
          <Card>
            <div>
              <p className="b completed mt3">
                <CheckOutlined /> Completed
              </p>
              <br />
              <small>This workflow has been completed.</small>
            </div>
          </Card>
        </Col>
        <Col className="col-info">
          <Card>
            <p className="waiting">
              {new Date('2024-04-26T03:34:16.728144').toLocaleDateString()}
            </p>
            <p className="waiting">submitter</p>
            <p className="waiting">ph19resch11003@iith.ac.in</p>
          </Card>
        </Col>
        <Col className="col-subject">
          <Card>
            <div className="mb2">
              <UnclickableTag color="blue">hep-ph</UnclickableTag>
            </div>
            <div className="mb2">
              <UnclickableTag color="blue">hep-ex</UnclickableTag>
            </div>
            <div className="mb2">
              <UnclickableTag color="blue">physics</UnclickableTag>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AuthorResultItem;
