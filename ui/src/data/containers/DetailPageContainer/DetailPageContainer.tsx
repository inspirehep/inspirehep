import React from 'react';

import { connect, RootStateOrAny } from 'react-redux';
import { Col, Row } from 'antd';
import { List } from 'immutable';
import classNames from 'classnames';
import './DetailPage.less';
import RequireOneOf from '../../../common/components/RequireOneOf';
import { isSuperUser } from '../../../common/authorization';

import fetchData, { fetchDataAuthors } from '../../../actions/data';
import withRouteActionsDispatcher from '../../../common/withRouteActionsDispatcher';
import ContentBox from '../../../common/components/ContentBox';
import LiteratureDate from '../../../common/components/LiteratureDate';
import LiteratureTitle from '../../../common/components/LiteratureTitle';
import KeywordList from '../../../common/components/KeywordList';
import ExperimentList from '../../../common/components/ExperimentList';
import { APIButton } from '../../../common/components/APIButton';
import UrlsAction from '../../../literature/components/UrlsAction';
import AuthorsAndCollaborations from '../../../common/components/AuthorsAndCollaborations';
import Abstract from '../../../literature/components/Abstract';
import LiteratureRecordsList from '../../../common/components/LiteratureRecordsList';
import DOIListShowAll from '../../components/DOIListShowAll';
import IncomingLiteratureReferencesLinkAction from '../../../common/components/IncomingLiteratureReferencesLinkAction';
import { getReferencingPapersQueryString } from '../../utils';
import DocumentHead from '../../../common/components/DocumentHead';
import { makeCompliantMetaDescription } from '../../../common/utils';

interface DetailPageProps {
  result: any; // TODO: define proper type for result
  authors: List<any>;
  isSuperUserLoggedIn: boolean;
}

const DetailPage = ({
  result,
  authors,
  isSuperUserLoggedIn,
}: DetailPageProps) => {
  const metadata = result.get('metadata');
  const title = metadata.getIn(['titles', 0]);
  const abstract = metadata.getIn(['abstracts', 0]);
  const keywords = metadata.get('keywords');
  const authorCount = (authors && authors.size) || 0;
  const dois = metadata.get('dois', List());
  const date = metadata.get('date');
  const recordId = metadata.get('control_number');
  const literatureRecords = metadata.get('literature');
  const acceleratorExperiments = metadata.get('accelerator_experiments');
  const collaborations = metadata.get('collaborations', List());
  const urls = metadata.get('urls');
  const citationCount = metadata.get('citation_count');

  const metaDescription =
    abstract && makeCompliantMetaDescription(abstract.get('value'));

  return (
    <>
      <DocumentHead title={title.get('title')} description={metaDescription} />
      <Row
        className="__DetailPage__"
        justify="center"
        data-testid="data-detail-page-container"
      >
        <Col xs={24} md={22} lg={21} xxl={18}>
          <Row className="mv3" justify="center" />
          <Row
            className="mv3"
            justify="center"
            gutter={{ xs: 0, lg: 16, xl: 32 }}
          >
            <Col xs={24} lg={24}>
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
                    {isSuperUserLoggedIn && (
                      <APIButton url={window.location.href} />
                    )}
                  </>
                }
                rightActions={
                  citationCount !== null && citationCount !== undefined ? (
                    <IncomingLiteratureReferencesLinkAction
                      itemCount={citationCount}
                      referenceType="citation"
                      linkQuery={getReferencingPapersQueryString(recordId)}
                      trackerEventId="Citations link"
                      eventCategory="Data search"
                    />
                  ) : (
                    <></>
                  )
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
                    {date && <LiteratureDate date={date} />}
                  </Col>
                </Row>
                <div className="mt3">
                  <DOIListShowAll dois={dois} />
                  <ExperimentList experiments={acceleratorExperiments} />
                  {literatureRecords && (
                    <Row className="mt2">
                      <Col>
                        <LiteratureRecordsList
                          literatureRecords={literatureRecords}
                        />
                      </Col>
                    </Row>
                  )}
                </div>
              </ContentBox>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <RequireOneOf dependencies={[abstract, keywords]}>
                <ContentBox>
                  <div>
                    <Abstract abstract={abstract} />
                  </div>
                  <div
                    className={classNames({
                      mb3: keywords,
                    })}
                  />
                  <div>
                    <KeywordList keywords={keywords} />
                  </div>
                </ContentBox>
              </RequireOneOf>
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
};

const mapStateToProps = (state: RootStateOrAny) => ({
  result: state.data.get('data'),
  authors: state.data.get('authors'),
  isSuperUserLoggedIn: isSuperUser(state.user.getIn(['data', 'roles'])),
});

const DetailPageContainer = connect(mapStateToProps)(DetailPage);

export default withRouteActionsDispatcher(DetailPageContainer, {
  routeParamSelector: ({ id }) => id,
  routeActions: (id) => [fetchData(id), fetchDataAuthors(id)],
  loadingStateSelector: (state) => !state.data.hasIn(['data', 'metadata']),
});
