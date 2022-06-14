import React from 'react';
import PropTypes from 'prop-types';
import { List, Map } from 'immutable';
import { Menu } from 'antd';
import { BookOutlined } from '@ant-design/icons';

import ExternalLink from '../../common/components/ExternalLink.tsx';
import ActionsDropdownOrAction from '../../common/components/ActionsDropdownOrAction';
import IconText from '../../common/components/IconText';
import JournalInfo from '../../common/components/JournalInfo';
import { LITERATURE } from '../../common/routes';

function getProceedingHref(recordId) {
  return `${LITERATURE}/${recordId}`;
}

function renderProceedingsDropdownAction(proceeding, index) {
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

function renderProceedingAction(proceeding, title) {
  const recordId = proceeding.get('control_number');
  return (
    <ExternalLink href={getProceedingHref(recordId)}>{title}</ExternalLink>
  );
}

const ACTION_TITLE = <IconText text="proceedings" icon={<BookOutlined />} />;

function ProceedingsAction({ proceedings }) {
  return (
    <ActionsDropdownOrAction
      values={proceedings}
      renderAction={renderProceedingAction}
      renderDropdownAction={renderProceedingsDropdownAction}
      title={ACTION_TITLE}
    />
  );
}

ProceedingsAction.propTypes = {
  proceedings: PropTypes.instanceOf(List).isRequired,
};

export default ProceedingsAction;
