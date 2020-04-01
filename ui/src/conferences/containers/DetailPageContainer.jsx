import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { Row, Col } from 'antd';
import DocumentHead from '../../common/components/DocumentHead';
import ConferenceTitle from '../components/ConferenceTitle';
import ConferenceDates from '../components/ConferenceDates';
import fetchConference from '../../actions/conferences';
import InspireCategoryList from '../components/InspireCategoryList';
import ContentBox from '../../common/components/ContentBox';
import RichDescription from '../../common/components/RichDescription';
import ConferenceSeries from '../components/ConferenceSeries';
import ContactList from '../../common/components/ContactList';
import PublicNotesList from '../../common/components/PublicNotesList';
import KeywordList from '../../common/components/KeywordList';
import EditRecordAction from '../../common/components/EditRecordAction';
import ProceedingsAction from '../components/ProceedingsAction';
import ConferenceWebsitesAction from '../../common/components/WebsitesAction';
import AddressList from '../../common/components/AddressList';
import ConferenceContributions from '../components/ConferenceContributions';
import { newSearch } from '../../actions/search';
import { CONFERENCE_CONTRIBUTIONS_NS } from '../../reducers/search';
import DeletedAlert from '../../common/components/DeletedAlert';
import { makeCompliantMetaDescription } from '../../common/utils';
import withRouteActionsDispatcher from '../../common/withRouteActionsDispatcher';

function DetailPage({ record }) {
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
      <Row type="flex" justify="center">
        <Col className="mv3" xs={24} md={22} lg={21} xxl={18}>
          <ContentBox
            className="sm-pb3"
            leftActions={
              <>
                {urls && <ConferenceWebsitesAction websites={urls} />}
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
                  <ConferenceTitle title={title} acronym={acronym} />
                </h2>
              </Col>
            </Row>
            <Row>
              <Col>
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
                  <ConferenceSeries series={series} />
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
      <Row type="flex" justify="center">
        <Col xs={24} md={22} lg={21} xxl={18}>
          <ContentBox>
            <ConferenceContributions conferenceRecordId={controlNumber} />
          </ContentBox>
        </Col>
      </Row>
    </>
  );
}

DetailPage.propTypes = {
  record: PropTypes.instanceOf(Map).isRequired,
};

const mapStateToProps = state => ({
  record: state.conferences.get('data'),
});
const DetailPageContainer = connect(mapStateToProps)(DetailPage);

export default withRouteActionsDispatcher(DetailPageContainer, {
  routeParamSelector: ({ id }) => id,
  routeActions: id => [
    fetchConference(id),
    newSearch(CONFERENCE_CONTRIBUTIONS_NS),
  ],
  loadingStateSelector: state => !state.conferences.hasIn(['data', 'metadata']),
});
