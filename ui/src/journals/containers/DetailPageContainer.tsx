import React, { useState } from 'react';
import './DetailPage.less';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Row, Col, PageHeader, Button } from 'antd';
import { List } from 'immutable';

import fetchJournal from '../../actions/journals';
import withRouteActionsDispatcher from '../../common/withRouteActionsDispatcher';
import ContentBox from '../../common/components/ContentBox';
import DocumentHead from '../../common/components/DocumentHead';
import UrlsAction from '../../literature/components/UrlsAction';
import PublicNotesList from '../../common/components/PublicNotesList';
import { Journal } from './SearchPageContainer';
import { LITERATURE } from '../../common/routes';
import { JOURNALS_PID_TYPE } from '../../common/constants';
import { JournalTitlesListModal } from '../components/JournalTitlesListModal';
import EditRecordAction from '../../common/components/EditRecordAction';
import {
  isCataloger,
  isSuperUser,
  SUPERUSER_OR_CATALOGER,
} from '../../common/authorization';
import AuthorizedContainer from '../../common/containers/AuthorizedContainer';
import JournalPapers from '../components/JournalPapers';
import { APIButton } from '../../common/components/APIButton';

interface RootState {
  journals: {
    get: (values: string) => Journal;
    hasIn: (values: string[]) => boolean;
  };
  user: {
    getIn: (arg: string[]) => List<string>;
  };
}

export const DetailPage = ({
  result,
  isCatalogerLoggedIn,
  isSuperUserLoggedIn,
}: {
  result: Journal;
  isCatalogerLoggedIn: boolean;
  isSuperUserLoggedIn: boolean;
}) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const metadata = result.get('metadata');

  const shortTitle = metadata.get('short_title') as unknown as string;
  const journalTitle = metadata.get('journal_title') as unknown as string;
  const urls = metadata.get('urls') as unknown as List<string>;
  const publicNotes = metadata.get('public_notes') as unknown as string[];
  const titleVariants = metadata.get(
    'title_variants'
  ) as unknown as List<string>;
  const publisher = metadata.get('publisher') as unknown as List<string>;
  const recordId = metadata.get('control_number') as unknown as number;

  const onModalVisibilityChange = () => {
    setModalVisible(!modalVisible);
  };

  return (
    <>
      <DocumentHead title={shortTitle} />
      <Row justify="center">
        <Col className="mv3" xs={24} md={22} lg={21} xxl={18}>
          <ContentBox
            className="sm-pb3"
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
                    isCatalogerLoggedIn={isCatalogerLoggedIn}
                    pidType={JOURNALS_PID_TYPE}
                    pidValue={recordId}
                    page="Journals detail"
                  />
                </AuthorizedContainer>
                {isSuperUserLoggedIn && (
                  <APIButton url={window.location.href} />
                )}
              </>
            }
          >
            <Row>
              <Col>
                <PageHeader
                  className="site-page-header"
                  title={shortTitle}
                  subTitle={
                    publisher &&
                    `(${publisher.toArray().map((p: string) => p)})`
                  }
                />
              </Col>
            </Row>
            <Row>
              <Col>
                {journalTitle}
                {titleVariants && (
                  <>
                    <Button
                      className="btn-ghost"
                      onClick={onModalVisibilityChange}
                    >
                      Show other names ({titleVariants.toArray().length})
                    </Button>
                    <JournalTitlesListModal
                      modalVisible={modalVisible}
                      onModalVisibilityChange={onModalVisibilityChange}
                      titleVariants={titleVariants.toArray()}
                    />
                  </>
                )}
              </Col>
            </Row>
            {publicNotes && (
              <Row className="mt2">
                <Col>
                  <PublicNotesList publicNotes={publicNotes} />
                </Col>
              </Row>
            )}
            <Row className="mt2">
              <Col>
                <Link
                  to={`${LITERATURE}?sort=mostrecent&size=25&page=1&q=publication_info.journal_title:"${shortTitle}"`}
                >
                  Articles published in {shortTitle}
                </Link>
              </Col>
            </Row>
          </ContentBox>
        </Col>
      </Row>
      <Row justify="center">
        <Col xs={24} md={22} lg={21} xxl={18}>
          <ContentBox>
            <JournalPapers journalName={shortTitle} />
          </ContentBox>
        </Col>
      </Row>
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  result: state.journals.get('data'),
  isCatalogerLoggedIn: isCataloger(state.user.getIn(['data', 'roles'])),
  isSuperUserLoggedIn: isSuperUser(state.user.getIn(['data', 'roles'])),
});

const DetailPageContainer = connect(mapStateToProps)(DetailPage);

export default withRouteActionsDispatcher(DetailPageContainer, {
  routeParamSelector: (args) => args,
  routeActions: (args) => [fetchJournal(args.id)],
  loadingStateSelector: (state: RootState) =>
    !state.journals.hasIn(['data', 'metadata']),
});
