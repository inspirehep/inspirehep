import React, { useCallback } from 'react';
import { Map } from 'immutable';
import { Button, Menu } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';

import ListItemAction from '../../../common/components/ListItemAction';
import IconText from '../../../common/components/IconText';
import DropdownMenu from '../../../common/components/DropdownMenu';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import ExternalLink from '../../../common/components/ExternalLink.tsx';
import getIcsFileContent from './ics';
import { downloadTextAsFile } from '../../../common/utils';
import getGoogleCalendarUrl from './google';

const TITLE = <IconText icon={<CalendarOutlined />} text="export" />;

type Props = {
    seminar: $TSFixMe; // TODO: PropTypes.instanceOf(Map)
};

function ExportToCalendarAction({ seminar }: Props) {
  const onDownloadClick = useCallback(
    () => {
      const fileContent = getIcsFileContent(seminar);
      const controlNumber = seminar.get('control_number');
      downloadTextAsFile(
        fileContent,
        `INSPIRE-Seminar-${controlNumber}.ics`,
        'text/calendar'
      );
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

export default ExportToCalendarAction;
