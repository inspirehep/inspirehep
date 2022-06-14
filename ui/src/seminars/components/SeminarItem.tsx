import React from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Link } from 'react-router-dom';
import { Map } from 'immutable';

import { VideoCameraAddOutlined, FileOutlined } from '@ant-design/icons';
import { Row, Col } from 'antd';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import EditRecordAction from '../../common/components/EditRecordAction.tsx';
import ResultItem from '../../common/components/ResultItem';
import { SEMINARS } from '../../common/routes';
import AuthorList from '../../common/components/AuthorList';
import { doTimezonesHaveDifferentTimes } from '../../common/utils';
import EventTitle from '../../common/components/EventTitle';
import SeminarDateTimes from './SeminarDateTimes';
import { LOCAL_TIMEZONE } from '../../common/constants';
import ExportToCalendarAction from './ExportToCalendarAction/ExportToCalendarAction';
import UrlsAction from '../../literature/components/UrlsAction';

type OwnProps = {
    metadata: $TSFixMe; // TODO: PropTypes.instanceOf(Map)
    selectedTimezone?: string;
    enableActions?: boolean;
};

// @ts-expect-error ts-migrate(2565) FIXME: Property 'defaultProps' is used before being assig... Remove this comment to see the full error message
type Props = OwnProps & typeof SeminarItem.defaultProps;

function SeminarItem({ metadata, selectedTimezone, enableActions }: Props) {
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
  return (
    <ResultItem
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
              <EditRecordAction pidType="seminars" pidValue={recordId} />
            )}
          </>
        )
      }
    >
      {/* @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call. */}
      <Row type="flex">
        <Col>
          <Link className="result-item-title" to={`${SEMINARS}/${recordId}`}>
            <EventTitle title={title} />
          </Link>
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

SeminarItem.defaultProps = {
  enableActions: true,
};

export default SeminarItem;
