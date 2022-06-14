import React from 'react';
import { List, Map } from 'immutable';
import { Menu } from 'antd';
import { BookOutlined } from '@ant-design/icons';

// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import ExternalLink from '../../common/components/ExternalLink.tsx';
import ActionsDropdownOrAction from '../../common/components/ActionsDropdownOrAction';
import IconText from '../../common/components/IconText';
import JournalInfo from '../../common/components/JournalInfo';
import { LITERATURE } from '../../common/routes';

function getProceedingHref(recordId: $TSFixMe) {
  return `${LITERATURE}/${recordId}`;
}

function renderProceedingsDropdownAction(proceeding: $TSFixMe, index: $TSFixMe) {
  const recordId = proceeding.get('control_number');
  const publicationInfo = proceeding.getIn(['publication_info', 0], Map());
  return (
    <Menu.Item key={recordId}>
      <ExternalLink href={getProceedingHref(recordId)}>
        {publicationInfo.has('journal_title') ? (
          <JournalInfo info={publicationInfo} />
        ) : (
          <span>Proceedings {index + 1}</span>
        )}
      </ExternalLink>
    </Menu.Item>
  );
}

function renderProceedingAction(proceeding: $TSFixMe, title: $TSFixMe) {
  const recordId = proceeding.get('control_number');
  return (
    <ExternalLink href={getProceedingHref(recordId)}>{title}</ExternalLink>
  );
}

const ACTION_TITLE = <IconText text="proceedings" icon={<BookOutlined />} />;

type Props = {
    proceedings: $TSFixMe; // TODO: PropTypes.instanceOf(List)
};

function ProceedingsAction({ proceedings }: Props) {
  return (
    <ActionsDropdownOrAction
      values={proceedings}
      renderAction={renderProceedingAction}
      renderDropdownAction={renderProceedingsDropdownAction}
      title={ACTION_TITLE}
    />
  );
}

export default ProceedingsAction;
