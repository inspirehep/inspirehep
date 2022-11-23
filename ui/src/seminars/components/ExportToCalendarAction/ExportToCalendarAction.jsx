import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { Button, Menu } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';

import UserAction from '../../../common/components/UserAction';
import IconText from '../../../common/components/IconText';
import DropdownMenu from '../../../common/components/DropdownMenu';
import LinkWithTargetBlank from '../../../common/components/LinkWithTargetBlank.tsx';
import getIcsFileContent from './ics';
import { downloadTextAsFile } from '../../../common/utils';
import getGoogleCalendarUrl from './google';
import EventTracker from '../../../common/components/EventTracker';

const TITLE = <IconText icon={<CalendarOutlined />} text="export" />;

function ExportToCalendarAction({ seminar, page }) {
  const onDownloadClick = useCallback(() => {
    const fileContent = getIcsFileContent(seminar);
    const controlNumber = seminar.get('control_number');
    downloadTextAsFile(
      fileContent,
      `INSPIRE-Seminar-${controlNumber}.ics`,
      'text/calendar'
    );
  }, [seminar]);
  
  return (
    <UserAction>
      <DropdownMenu title={<Button>{TITLE}</Button>}>
        <EventTracker
          eventCategory={page}
          eventAction="Download"
          eventId="Download .ics"
        >
          <Menu.Item onClick={onDownloadClick}>Download .ics</Menu.Item>
        </EventTracker>
        <EventTracker
          eventCategory={page}
          eventAction="Link"
          eventId="Add to Google Calendar"
        >
          <Menu.Item>
            <LinkWithTargetBlank href={getGoogleCalendarUrl(seminar)}>
              Google Calendar
            </LinkWithTargetBlank>
          </Menu.Item>
        </EventTracker>
      </DropdownMenu>
    </UserAction>
  );
}

ExportToCalendarAction.propTypes = {
  seminar: PropTypes.instanceOf(Map).isRequired,
};

export default ExportToCalendarAction;
