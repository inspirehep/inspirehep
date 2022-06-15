import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Map } from 'immutable';

import { VideoCameraAddOutlined, FileOutlined } from '@ant-design/icons';
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

function SeminarItem({
  metadata,
  selectedTimezone,
  enableActions
}: any) {
  const title = metadata.get('title');
  const recordId = metadata.get('control_number');
  const canEdit = metadata.get('can_edit', false);
  const urls = metadata.get('urls');
  const joinUrls = metadata.get('join_urls');
  const materialUrls = metadata.get('material_urls');
  const speakers = metadata.get('speakers');
  const startDate = metadata.get('start_datetime');
  const endDate = metadata.get('end_datetime');
  const timezoneDifferentThanLocal =
    selectedTimezone &&
    doTimezonesHaveDifferentTimes(selectedTimezone, LOCAL_TIMEZONE);

  const authorListProps = {
    authors: speakers
  }

  return (
    <ResultItem
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      leftActions={
        enableActions && (
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
              /* @ts-ignore */
              <EditRecordAction pidType="seminars" pidValue={recordId} />
            )}
          </>
        )
      }
    >
      <Row>
        <Col>
          <Link className="result-item-title" to={`${SEMINARS}/${recordId}`}>
            <EventTitle title={title} />
          </Link>
        </Col>
      </Row>
      <Row>
        <Col>
          <AuthorList {...authorListProps} />
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
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof Map' is not assignable to... Remove this comment to see the full error message
  metadata: PropTypes.instanceOf(Map).isRequired,
  selectedTimezone: PropTypes.string,
  enableActions: PropTypes.bool,
};

SeminarItem.defaultProps = {
  enableActions: true,
};

export default SeminarItem;
