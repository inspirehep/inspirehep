import React from 'react';
import { FilePdfOutlined } from '@ant-design/icons';
import { Row, Col, Card, Button } from 'antd';
import { Link } from 'react-router-dom';

import PublicationSelectContainer from '../../../authors/containers/PublicationSelectContainer';
import AuthorList from '../../../common/components/AuthorList';
import ResultItem from '../../../common/components/ResultItem';
import UnclickableTag from '../../../common/components/UnclickableTag';
import { HOLDINGPEN_NEW } from '../../../common/routes';

const ResultitemWithComparison = ({ item }: { item: any }) => {
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
              <b>Published in:</b> Nuclear Physics B 1004 (2024) , 116553
            </small>
          </ResultItem>
        </Col>
        <Col className="col-actions">
          <Card>
            <Button className="font-white bg-completed db w-100 mb3">
              Best match
            </Button>
            <Button className="font-white bg-error db w-100">
              None of these
            </Button>
          </Card>
        </Col>
        <Col className="col-info">
          <Card>
            <p className="waiting">
              {new Date('2024-04-26T03:34:16.728144').toLocaleDateString()}
            </p>
            <p className="waiting">Elsevier</p>
            <a className="db w-100" href="/">
              <FilePdfOutlined className="mr1" />
              PDF
            </a>
          </Card>
        </Col>
        <Col className="col-subject">
          <Card>
            <div className="mb2">
              <UnclickableTag color="blue">Pheno-HEP</UnclickableTag>
            </div>
            <div className="mb2">
              <UnclickableTag color="blue">hep-ph</UnclickableTag>
            </div>
          </Card>
        </Col>
      </Row>
      <Row className="mv3 ml4 b f5 blue">Matches:</Row>
      <Row justify="start" wrap={false}>
        <Col className="col-pub-select">
          <PublicationSelectContainer
            claimed={false}
            disabled={false}
            isOwnProfile={false}
            recordId={0}
          />
        </Col>
        <Col className="col-details-2">
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
              <b>Published in:</b> Nuclear Physics B 1004 (2024) , 116553
            </small>
          </ResultItem>
        </Col>
      </Row>
      <Row justify="start" wrap={false}>
        <Col className="col-pub-select">
          <PublicationSelectContainer
            claimed={false}
            disabled={false}
            isOwnProfile={false}
            recordId={0}
          />
        </Col>
        <Col className="col-details-2 mt2">
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
              <b>Published in:</b> Phys. Lett. (2023) , 116553
            </small>
          </ResultItem>
        </Col>
      </Row>
    </div>
  );
};

export default ResultitemWithComparison;
