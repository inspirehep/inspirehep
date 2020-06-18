import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Map } from 'immutable';

import { VideoCameraAddOutlined } from '@ant-design/icons';
import { Row, Col } from 'antd';
import EditRecordAction from '../../common/components/EditRecordAction';
import ResultItem from '../../common/components/ResultItem';
import { SEMINARS } from '../../common/routes';
import AuthorList from '../../common/components/AuthorList';
import { doTimezonesHaveDifferentTimes } from '../../common/utils';
import EventTitle from '../../common/components/EventTitle';
import SeminarDateTimes from './SeminarDateTimes';
import { LOCAL_TIMEZONE } from '../../common/constants';
import ExportToCalendarAction from './ExportToCalendarAction/ExportToCalendarAction';
import UrlsAction from '../../literature/components/UrlsAction';

function SeminarItem({ metadata, selectedTimezone }) {
  const title = metadata.get('title');
  const recordId = metadata.get('control_number');
  const canEdit = metadata.get('can_edit', false);
  const urls = metadata.get('urls');
  const joinUrls = metadata.get('join_urls');
  const speakers = metadata.get('speakers');
  const startDate = metadata.get('start_datetime');
  const endDate = metadata.get('end_datetime');
  const timezoneDifferentThanLocal =
    selectedTimezone &&
    doTimezonesHaveDifferentTimes(selectedTimezone, LOCAL_TIMEZONE);
  return (
    <ResultItem
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
      <Row type="flex">
        <Col>
          <Link className="result-item-title" to={`${SEMINARS}/${recordId}`}>
            <EventTitle title={title} />
          </Link>
        </Col>
      </Row>
      <Row>
        <Col>
          <AuthorList authors={speakers} />
        </Col>
      </Row>
      <Row>
        <Col>
          {timezoneDifferentThanLocal ? (
            <>
              <SeminarDateTimes
                startDate={startDate}
                endDate={endDate}
                timezone={selectedTimezone}
                displayTimezone
                className="red"
              />{' '}
              (
              <SeminarDateTimes
                startDate={startDate}
                endDate={endDate}
                timezone={LOCAL_TIMEZONE}
                displayTimezone
              />
              )
            </>
          ) : (
            <SeminarDateTimes
              startDate={startDate}
              endDate={endDate}
              timezone={LOCAL_TIMEZONE}
            />
          )}
        </Col>
      </Row>
    </ResultItem>
  );
}

SeminarItem.propTypes = {
  metadata: PropTypes.instanceOf(Map).isRequired,
  selectedTimezone: PropTypes.string,
};

export default SeminarItem;
