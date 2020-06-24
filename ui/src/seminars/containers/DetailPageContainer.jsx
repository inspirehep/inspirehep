import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { Row, Col } from 'antd';
import { VideoCameraAddOutlined } from '@ant-design/icons';

import DocumentHead from '../../common/components/DocumentHead';
import fetchSeminar from '../../actions/seminars';
import ContentBox from '../../common/components/ContentBox';
import EditRecordAction from '../../common/components/EditRecordAction';
import DeletedAlert from '../../common/components/DeletedAlert';
import withRouteActionsDispatcher from '../../common/withRouteActionsDispatcher';
import AuthorList from '../../common/components/AuthorList';
import Address from '../../common/components/Address';
import InspireCategoryList from '../../conferences/components/InspireCategoryList';
import Abstract from '../../literature/components/Abstract';
import EventSeries from '../../common/components/EventSeries';
import ContactList from '../../common/components/ContactList';
import PublicNotesList from '../../common/components/PublicNotesList';
import KeywordList from '../../common/components/KeywordList';
import {
  doTimezonesHaveDifferentTimes,
  makeCompliantMetaDescription,
} from '../../common/utils';
import EventTitle from '../../common/components/EventTitle';
import SeminarDateTimes from '../components/SeminarDateTimes';
import { LOCAL_TIMEZONE, SEMINARS_PID_TYPE } from '../../common/constants';
import ExportToCalendarAction from '../components/ExportToCalendarAction/ExportToCalendarAction';
import UrlsAction from '../../literature/components/UrlsAction';
import LiteratureRecordsList from '../components/LiteratureRecordsList';

function DetailPage({ record }) {
  const metadata = record.get('metadata');
  const title = metadata.get('title');
  const recordId = metadata.get('control_number');
  const canEdit = metadata.get('can_edit', false);
  const urls = metadata.get('urls');
  const joinUrls = metadata.get('join_urls');
  const speakers = metadata.get('speakers');
  const deleted = metadata.get('deleted');
  const address = metadata.get('address');
  const inspireCategories = metadata.get('inspire_categories');
  const abstract = metadata.get('abstract');
  const series = metadata.get('series');
  const contacts = metadata.get('contact_details');
  const keywords = metadata.get('keywords');
  const publicNotes = metadata.get('public_notes');
  const startDate = metadata.get('start_datetime');
  const endDate = metadata.get('end_datetime');
  const timezone = metadata.get('timezone');
  const literatureRecords = metadata.get('literature_records');

  return (
    <>
      <DocumentHead
        title={title.get('title')}
        description={makeCompliantMetaDescription(
          abstract && abstract.get('value')
        )}
      />
      <Row type="flex" justify="center">
        <Col className="mv3" xs={24} md={22} lg={21} xxl={18}>
          <ContentBox
            className="sm-pb3"
            leftActions={
              <>
                {urls && <UrlsAction urls={urls} />}
                {joinUrls && (
                  <UrlsAction
                    urls={joinUrls}
                    icon={<VideoCameraAddOutlined />}
                    text="join"
                  />
                )}
                <ExportToCalendarAction seminar={metadata} />
                {canEdit && (
                  <EditRecordAction pidType="seminars" pidValue={recordId} />
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
                  <EventTitle title={title} />
                </h2>
              </Col>
            </Row>
            <Row>
              <Col>
                <AuthorList authors={speakers} />
              </Col>
            </Row>
            <Row>
              <Col>
                <SeminarDateTimes
                  startDate={startDate}
                  endDate={endDate}
                  timezone={LOCAL_TIMEZONE}
                  displayTimezone
                />
                {doTimezonesHaveDifferentTimes(timezone, LOCAL_TIMEZONE) && (
                  <>
                    {' '}
                    (
                    <SeminarDateTimes
                      startDate={startDate}
                      endDate={endDate}
                      timezone={timezone}
                      displayTimezone
                    />
                    )
                  </>
                )}
              </Col>
            </Row>
            {address && (
              <Row>
                <Col>
                  <Address address={address} />
                </Col>
              </Row>
            )}
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
            {abstract && (
              <Row className="mt2">
                <Col>
                  <Abstract abstract={abstract} />
                </Col>
              </Row>
            )}
            {series && (
              <Row className="mt3">
                <Col>
                  <EventSeries series={series} pidType={SEMINARS_PID_TYPE} />
                </Col>
              </Row>
            )}
            {literatureRecords && (
              <Row className="mt2">
                <Col>
                  <LiteratureRecordsList
                    literatureRecords={literatureRecords}
                    wrapperClassName="di"
                  />
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
    </>
  );
}

DetailPage.propTypes = {
  record: PropTypes.instanceOf(Map).isRequired,
};

const mapStateToProps = state => ({
  record: state.seminars.get('data'),
});
const DetailPageContainer = connect(mapStateToProps)(DetailPage);

export default withRouteActionsDispatcher(DetailPageContainer, {
  routeParamSelector: ({ id }) => id,
  routeActions: id => [fetchSeminar(id)],
  loadingStateSelector: state => !state.seminars.hasIn(['data', 'metadata']),
});
