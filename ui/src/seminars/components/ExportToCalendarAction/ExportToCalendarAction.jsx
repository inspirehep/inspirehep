import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { Button, Menu } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';

import ListItemAction from '../../../common/components/ListItemAction';
import IconText from '../../../common/components/IconText';
import DropdownMenu from '../../../common/components/DropdownMenu';
import ExternalLink from '../../../common/components/ExternalLink';
import getIcsFileContent from './ics';
import { downloadTextAsFile } from '../../../common/utils';
import getGoogleCalendarUrl from './google';

const TITLE = <IconText icon={<CalendarOutlined />} text="export" />;

function ExportToCalendarAction({ seminar }) {
  const onDownloadClick = useCallback(
    () => {
      const fileContent = getIcsFileContent(seminar);
      downloadTextAsFile(fileContent, 'text/calendar', 'ics');
    },
    [seminar]
  );
  return (
    <ListItemAction>
      <DropdownMenu title={<Button>{TITLE}</Button>}>
        <Menu.Item onClick={onDownloadClick}>Download .ics</Menu.Item>
        <Menu.Item>
          <ExternalLink href={getGoogleCalendarUrl(seminar)}>
            Google Calendar
          </ExternalLink>
        </Menu.Item>
      </DropdownMenu>
    </ListItemAction>
  );
}

ExportToCalendarAction.propTypes = {
  seminar: PropTypes.instanceOf(Map).isRequired,
};

export default ExportToCalendarAction;
