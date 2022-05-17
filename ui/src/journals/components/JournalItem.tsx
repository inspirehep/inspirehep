import React from 'react';
import { Row, Col, PageHeader } from 'antd';
import { Link } from 'react-router-dom';

import ResultItem from '../../common/components/ResultItem';
import EditRecordAction from '../../common/components/EditRecordAction';
import AuthorizedContainer from '../../common/containers/AuthorizedContainer';
import { SUPERUSER_OR_CATALOGER } from '../../common/authorization';
import { JOURNALS_PID_TYPE } from '../../common/constants';
import UrlsAction from '../../literature/components/UrlsAction';
import { JOURNALS } from '../../common/routes';
import { Journal } from '../containers/SearchPageContainer';

export const JournalItem = ({
  result,
  isCatalogerLoggedIn,
}: {
  result: Journal;
  isCatalogerLoggedIn: boolean;
}) => {
  const metadata = result.get('metadata');
  const shortTitle = metadata.get('short_title');
  const journalTitle = metadata.get('journal_title');
  const urls = metadata.get('urls');
  const recordId = metadata.get('control_number').toString();
  const publisher = metadata.get('publisher');

  return (
    <ResultItem
      leftActions={
        <>
          {urls && <UrlsAction urls={urls} text="links" />}
          {/* @ts-ignore */}
          <AuthorizedContainer authorizedRoles={SUPERUSER_OR_CATALOGER}>
            <EditRecordAction
              pidType={JOURNALS_PID_TYPE}
              pidValue={recordId}
              isCatalogerLoggedIn={isCatalogerLoggedIn}
            />
          </AuthorizedContainer>
        </>
      }
    >
      <Row>
        <Col>
          <Link className="result-item-title" to={`${JOURNALS}/${recordId}`}>
            <PageHeader
              className="site-page-header"
              title={shortTitle}
              subTitle={
                // @ts-ignore
                publisher ? `(${publisher.toArray().map((p: string) => p)})` : false
              }
            />
          </Link>
        </Col>
      </Row>
      <Row>
        <Col>{journalTitle}</Col>
      </Row>
    </ResultItem>
  );
};
