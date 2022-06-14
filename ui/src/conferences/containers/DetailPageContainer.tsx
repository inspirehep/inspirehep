import React from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';
import { Map } from 'immutable';
import { Row, Col } from 'antd';
import DocumentHead from '../../common/components/DocumentHead';
import ConferenceDates from '../components/ConferenceDates';
import fetchConference from '../../actions/conferences';
import InspireCategoryList from '../components/InspireCategoryList';
import ContentBox from '../../common/components/ContentBox';
import RichDescription from '../../common/components/RichDescription';
import EventSeries from '../../common/components/EventSeries';
import ContactList from '../../common/components/ContactList';
import PublicNotesList from '../../common/components/PublicNotesList';
import KeywordList from '../../common/components/KeywordList';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import EditRecordAction from '../../common/components/EditRecordAction.tsx';
import ProceedingsAction from '../components/ProceedingsAction';
import AddressList from '../../common/components/AddressList';
import ConferenceContributions from '../components/ConferenceContributions';
import { newSearch } from '../../actions/search';
import { CONFERENCE_CONTRIBUTIONS_NS } from '../../search/constants';
import DeletedAlert from '../../common/components/DeletedAlert';
import { makeCompliantMetaDescription } from '../../common/utils';
import withRouteActionsDispatcher from '../../common/withRouteActionsDispatcher';
import EventTitle from '../../common/components/EventTitle';
import { CONFERENCES_PID_TYPE } from '../../common/constants';
import UrlsAction from '../../literature/components/UrlsAction';

type DetailPageProps = {
    record: $TSFixMe; // TODO: PropTypes.instanceOf(Map)
};

function DetailPage({ record }: DetailPageProps) {
  const metadata = record.get('metadata');
  const controlNumber = metadata.get('control_number');
  const title = metadata.getIn(['titles', 0]);
  const acronym = metadata.getIn(['acronyms', 0]);
  const openingDate = metadata.get('opening_date');
  const closingDate = metadata.get('closing_date');
  const addresses = metadata.get('addresses');
  const cnum = metadata.get('cnum');
  const description = metadata.getIn(['short_description', 'value']);
  const inspireCategories = metadata.get('inspire_categories');
  const series = metadata.get('series');
  const contacts = metadata.get('contact_details');
  const publicNotes = metadata.get('public_notes');
  const keywords = metadata.get('keywords');
  const urls = metadata.get('urls');
  const proceedings = metadata.get('proceedings');
  const canEdit = metadata.get('can_edit', false);
  const deleted = metadata.get('deleted', false);

  const metaDescription = makeCompliantMetaDescription(description);

  return (
    <>
      <DocumentHead title={title.get('title')} description={metaDescription} />
      {/* @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call. */}
      <Row type="flex" justify="center">
        <Col className="mv3" xs={24} md={22} lg={21} xxl={18}>
          {/* @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call. */}
          <ContentBox
            className="sm-pb3"
            leftActions={
              <>
                {urls && <UrlsAction urls={urls} />}
                {proceedings && <ProceedingsAction proceedings={proceedings} />}
                {canEdit && (
                  <EditRecordAction
                    pidType="conferences"
                    pidValue={controlNumber}
                  />
                )}
              </>
            }
          >
            <Row>
              <Col span={24}>{deleted && <DeletedAlert />}</Col>
            </Row>
            <Row>
              <Col>
                <h2>
                  <EventTitle title={title} acronym={acronym} />
                </h2>
              </Col>
            </Row>
            <Row>
              <Col>
                {/* @ts-expect-error ts-migrate(2786) FIXME: 'ConferenceDates' cannot be used as a JSX componen... Remove this comment to see the full error message */}
                <ConferenceDates
                  openingDate={openingDate}
                  closingDate={closingDate}
                />
                {addresses && (
                  <>
                    {'. '}
                    <AddressList addresses={addresses} />
                  </>
                )}
                {cnum && ` (${cnum})`}
              </Col>
            </Row>
            {inspireCategories && (
              <Row className="mt2">
                <Col>
                  <InspireCategoryList
                    categories={inspireCategories}
                    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ categories: any; wrapperClassName: string;... Remove this comment to see the full error message
                    wrapperClassName="di"
                  />
                </Col>
              </Row>
            )}
            {description && (
              <Row className="mt3">
                <Col>
                  <RichDescription>{description}</RichDescription>
                </Col>
              </Row>
            )}
            {series && (
              <Row className="mt3">
                <Col>
                  <EventSeries series={series} pidType={CONFERENCES_PID_TYPE} />
                </Col>
              </Row>
            )}
            {contacts && (
              <Row className="mt2">
                <Col>
                  <ContactList contacts={contacts} />
                </Col>
              </Row>
            )}
            {publicNotes && (
              <Row className="mt2">
                <Col>
                  <PublicNotesList publicNotes={publicNotes} />
                </Col>
              </Row>
            )}
            {keywords && (
              <Row className="mt2">
                <Col>
                  <KeywordList keywords={keywords} />
                </Col>
              </Row>
            )}
          </ContentBox>
        </Col>
      </Row>
      {/* @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call. */}
      <Row type="flex" justify="center">
        <Col xs={24} md={22} lg={21} xxl={18}>
          {/* @ts-expect-error ts-migrate(2745) FIXME: This JSX tag's 'children' prop expects type 'never... Remove this comment to see the full error message */}
          <ContentBox>
            <ConferenceContributions conferenceRecordId={controlNumber} />
          </ContentBox>
        </Col>
      </Row>
    </>
  );
}

const mapStateToProps = (state: $TSFixMe) => ({
  record: state.conferences.get('data')
});
const DetailPageContainer = connect(mapStateToProps)(DetailPage);

export default withRouteActionsDispatcher(DetailPageContainer, {
  routeParamSelector: ({
    id
  }: $TSFixMe) => id,
  routeActions: (id: $TSFixMe) => [
    fetchConference(id),
    newSearch(CONFERENCE_CONTRIBUTIONS_NS),
  ],
  loadingStateSelector: (state: $TSFixMe) => !state.conferences.hasIn(['data', 'metadata']),
});
