import React, { useState } from 'react';
import './DetailPage.less';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Row, Col, PageHeader, Button } from 'antd';

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
import { isCataloger, SUPERUSER_OR_CATALOGER } from '../../common/authorization';
import AuthorizedContainer from '../../common/containers/AuthorizedContainer';

interface RootState {
  journals: {
    get: (values: string) => Journal;
    hasIn: (values: string[]) => boolean;
  };
  user: {
    getIn: (arg: string[]) => boolean;
  }
}

export const DetailPage = ({ result, isCatalogerLoggedIn }: { result: Journal, isCatalogerLoggedIn: boolean }) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const metadata = result.get('metadata');

  const shortTitle = metadata.get('short_title');
  const journalTitle = metadata.get('journal_title');
  const urls = metadata.get('urls');
  const publicNotes = metadata.get('public_notes');
  const titleVariants = metadata.get('title_variants');
  const publisher = metadata.get('publisher');
  const recordId = metadata.get('control_number');

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
                {urls && <UrlsAction urls={urls} text="links" />}
                {/* @ts-ignore */}
                <AuthorizedContainer authorizedRoles={SUPERUSER_OR_CATALOGER}>
                  <EditRecordAction
                    isCatalogerLoggedIn={isCatalogerLoggedIn}
                    pidType={JOURNALS_PID_TYPE}
                    pidValue={recordId.toString()}
                  />
                </AuthorizedContainer>
              </>
            }
          >
            <Row>
              <Col>
                <PageHeader
                  className="site-page-header"
                  title={shortTitle}
                  subTitle={
                    // @ts-ignore
                    publisher ? `(${publisher.toArray().map((p: string) => p)})` : false
                  }
                />
              </Col>
            </Row>
            <Row>
              <Col>
                {journalTitle}
                {titleVariants && (
                  <Button
                    className="btn-ghost"
                    onClick={onModalVisibilityChange}
                  >
                    {/* @ts-ignore */}
                    Show other names ({titleVariants.toArray().length})
                  </Button>
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
                  to={`${LITERATURE}?sort=mostrecent&size=25&page=1&q=publication_info.journal_title.raw:"${shortTitle}"`}
                >
                  Articles published in {shortTitle}
                </Link>
              </Col>
            </Row>
          </ContentBox>
        </Col>
      </Row>
      {titleVariants && (
        <JournalTitlesListModal
          modalVisible={modalVisible}
          onModalVisibilityChange={onModalVisibilityChange}
          // @ts-ignore
          titleVariants={titleVariants.toArray()}
        />
      )}
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  result: state.journals.get('data'),
  isCatalogerLoggedIn: isCataloger(state.user.getIn(['data', 'roles'])),
});

const DetailPageContainer = connect(mapStateToProps)(DetailPage);

export default withRouteActionsDispatcher(DetailPageContainer, {
  routeParamSelector: ({ id }: { id: number }) => id,
  routeActions: (id: number) => [fetchJournal(id)],
  loadingStateSelector: (state: RootState) =>
    !state.journals.hasIn(['data', 'metadata']),
});
