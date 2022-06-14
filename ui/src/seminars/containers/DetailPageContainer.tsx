import React from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';
import { Map } from 'immutable';
import { Row, Col } from 'antd';
import { VideoCameraAddOutlined, FileOutlined } from '@ant-design/icons';

import DocumentHead from '../../common/components/DocumentHead';
import fetchSeminar from '../../actions/seminars';
import ContentBox from '../../common/components/ContentBox';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import EditRecordAction from '../../common/components/EditRecordAction.tsx';
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

type DetailPageProps = {
    record: $TSFixMe; // TODO: PropTypes.instanceOf(Map)
};

function DetailPage({ record }: DetailPageProps) {
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
  const captioned = metadata.get('captioned');
  const materialUrls = metadata.get('material_urls');

  return (
    <>
      <DocumentHead
        title={title.get('title')}
        description={makeCompliantMetaDescription(
          abstract && abstract.get('value')
        )}
      />
      {/* @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call. */}
      <Row type="flex" justify="center">
        <Col className="mv3" xs={24} md={22} lg={21} xxl={18}>
          {/* @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call. */}
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
                {materialUrls && (
                  <UrlsAction
                    urls={materialUrls}
                    icon={<FileOutlined />}
                    text="material"
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
                {/* @ts-expect-error ts-migrate(2322) FIXME: Type 'any' is not assignable to type 'never'. */}
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
                    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ categories: any; wrapperClassName: string;... Remove this comment to see the full error message
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
                    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ literatureRecords: any; wrapperClassName: ... Remove this comment to see the full error message
                    wrapperClassName="di"
                  />
                </Col>
              </Row>
            )}
            {captioned && (
              <Row className="mt2">
                <Col>Contains captions</Col>
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

const mapStateToProps = (state: $TSFixMe) => ({
  record: state.seminars.get('data')
});
const DetailPageContainer = connect(mapStateToProps)(DetailPage);

export default withRouteActionsDispatcher(DetailPageContainer, {
  routeParamSelector: ({
    id
  }: $TSFixMe) => id,
  routeActions: (id: $TSFixMe) => [fetchSeminar(id)],
  loadingStateSelector: (state: $TSFixMe) => !state.seminars.hasIn(['data', 'metadata']),
});
