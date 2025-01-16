import React from 'react';

import { connect, RootStateOrAny } from 'react-redux';
import { Col, Row } from 'antd';
import { List } from 'immutable';
import './DetailPage.less';
import { isCataloger, isSuperUser } from '../../../common/authorization';

import fetchData from '../../../actions/data';
import withRouteActionsDispatcher from '../../../common/withRouteActionsDispatcher';
import ContentBox from '../../../common/components/ContentBox';
import LiteratureTitle from '../../../common/components/LiteratureTitle';
import { APIButton } from '../../../common/components/APIButton';
import EditRecordAction from '../../../common/components/EditRecordAction';
import UrlsAction from '../../../literature/components/UrlsAction';
import AuthorsAndCollaborations from '../../../common/components/AuthorsAndCollaborations';
import Abstract from '../../../literature/components/Abstract';
import LiteratureRecordsList from '../../../common/components/LiteratureRecordsList';
import DOIListShowAll from '../../components/DOIListShowAll';
import IncomingLiteratureReferencesLinkAction from '../../../common/components/IncomingLiteratureReferencesLinkAction';
import { getReferencingPapersQueryString } from '../../utils';

interface DetailPageProps {
  result: any; // TODO: define proper type for result
  isCatalogerLoggedIn: boolean;
  isSuperUserLoggedIn: boolean;
}

const DetailPage = ({
  result,
  isCatalogerLoggedIn,
  isSuperUserLoggedIn,
}: DetailPageProps) => {
  const metadata = result.get('metadata');
  const title = metadata.getIn(['titles', 0]);
  const abstract = metadata.getIn(['abstracts', 0]);
  const authors = metadata.get('authors');
  const authorCount = (authors && authors.size) || 0;
  const dois = metadata.get('dois', List());
  const recordId = metadata.get('control_number');
  const literatureRecords = metadata.get('literature');
  const collaborations = metadata.get('collaborations', List());
  const urls = metadata.get('urls');
  const citationCount = metadata.get('citation_count');

  return (
    <>
      <Row justify="center" data-testid="detail-page-container">
        <Col className="mv3" xs={24} md={22} lg={21} xxl={18}>
          <ContentBox
            className="sm-pb3"
            leftActions={
              <>
                {urls && (
                  <UrlsAction
                    urls={urls}
                    text="links"
                    page="Data detail"
                    trackerEventId="Data website"
                  />
                )}
                <EditRecordAction
                  isCatalogerLoggedIn={isCatalogerLoggedIn}
                  pidType="data"
                  pidValue={recordId}
                  page="Data detail"
                />
                {isSuperUserLoggedIn && (
                  <APIButton url={window.location.href} />
                )}
              </>
            }
            rightActions={
              <>
                {citationCount ? (
                  <IncomingLiteratureReferencesLinkAction
                    itemCount={citationCount}
                    referenceType="citation"
                    linkQuery={getReferencingPapersQueryString(recordId)}
                    trackerEventId="Citations link"
                    eventCategory="Data search"
                  />
                ) : <></>
                }
              </>
            }
          >
            <Row>
              <Col>
                <h2>
                  <LiteratureTitle title={title} />
                </h2>
                <div>
                  <AuthorsAndCollaborations
                    authorCount={authorCount}
                    authors={authors}
                    collaborations={collaborations}
                    enableAuthorsShowAll
                    page="Data detail"
                  />
                </div>
              </Col>
            </Row>
            <DOIListShowAll dois={dois} />
            {abstract && (
              <Row className="mt2">
                <Col>
                  <Abstract abstract={abstract} />
                </Col>
              </Row>
            )}
            {literatureRecords && (
              <Row className="mt2">
                <Col>
                  <LiteratureRecordsList
                    literatureRecords={literatureRecords}
                  />
                </Col>
              </Row>
            )}
          </ContentBox>
        </Col>
      </Row>
    </>
  );
};

const mapStateToProps = (state: RootStateOrAny) => ({
  result: state.data.get('data'),
  isCatalogerLoggedIn: isCataloger(state.user.getIn(['data', 'roles'])),
  isSuperUserLoggedIn: isSuperUser(state.user.getIn(['data', 'roles'])),
});

const DetailPageContainer = connect(mapStateToProps)(DetailPage);

export default withRouteActionsDispatcher(DetailPageContainer, {
  routeParamSelector: ({ id }) => id,
  routeActions: (id) => [fetchData(id)],
  loadingStateSelector: (state) => !state.data.hasIn(['data', 'metadata']),
});
