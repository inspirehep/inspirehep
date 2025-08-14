import React from 'react';
import { Row, Col, PageHeader } from 'antd';
import { Link } from 'react-router-dom';
import { LoginOutlined } from '@ant-design/icons';
import { List } from 'immutable';

import ResultItem from '../../common/components/ResultItem';
import EditRecordAction from '../../common/components/EditRecordAction';
import AuthorizedContainer from '../../common/containers/AuthorizedContainer';
import { SUPERUSER_OR_CATALOGER } from '../../common/authorization';
import { JOURNALS_PID_TYPE } from '../../common/constants';
import UrlsAction from '../../literature/components/UrlsAction';
import { JOURNALS, LITERATURE } from '../../common/routes';
import { Journal } from '../containers/SearchPageContainer';
import IconText from '../../common/components/IconText';
import UserAction from '../../common/components/UserAction';
import EventTracker from '../../common/components/EventTracker';
import { pluralizeUnlessSingle } from '../../common/utils';

export const JournalItem = ({
  result,
  isCatalogerLoggedIn,
}: {
  result: Journal;
  isCatalogerLoggedIn: boolean;
}) => {
  const metadata = result.get('metadata');
  const shortTitle = metadata.get('short_title') as unknown as string;
  const journalTitle = metadata.get('journal_title') as unknown as string;
  const urls = metadata.get('urls') as unknown as List<string>;
  const recordId = metadata.get('control_number') as unknown as number;
  const publisher = metadata.get('publisher') as unknown as List<string>;
  const numberOfPapers = metadata.get('number_of_papers') as unknown as number;

  return (
    <ResultItem
      leftActions={
        <>
          {urls && (
            <UrlsAction
              urls={urls}
              text="links"
              page="Journals search"
              trackerEventId="Journal website"
            />
          )}
          <AuthorizedContainer authorizedRoles={SUPERUSER_OR_CATALOGER}>
            <EditRecordAction
              pidType={JOURNALS_PID_TYPE}
              pidValue={recordId}
              isCatalogerLoggedIn={isCatalogerLoggedIn}
              page="Journals search"
            />
          </AuthorizedContainer>
        </>
      }
      rightActions={
        numberOfPapers ? (
          <UserAction>
            <EventTracker
              eventCategory="Journals search"
              eventAction="Literature references search"
              eventId="Journal papers"
            >
              <Link
                to={`${LITERATURE}?sort=mostrecent&size=25&page=1&q=publication_info.journal_title.raw:"${shortTitle}"`}
              >
                <IconText
                  text={`${numberOfPapers} ${pluralizeUnlessSingle(
                    'paper',
                    numberOfPapers
                  )}`}
                  icon={<LoginOutlined />}
                />
              </Link>
            </EventTracker>
          </UserAction>
        ) : null
      }
    >
      <Row>
        <Col>
          <Link className="result-item-title" to={`${JOURNALS}/${recordId}`}>
            <PageHeader
              className="site-page-header"
              title={shortTitle}
              subTitle={
                publisher && `(${publisher.toArray().map((p: string) => p)})`
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
