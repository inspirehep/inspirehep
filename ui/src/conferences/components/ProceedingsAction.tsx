import React from 'react';
import PropTypes from 'prop-types';
import { List, Map } from 'immutable';
import { Menu } from 'antd';
import { BookOutlined } from '@ant-design/icons';

// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import ExternalLink from '../../common/components/ExternalLink.tsx';
import ActionsDropdownOrAction from '../../common/components/ActionsDropdownOrAction';
import IconText from '../../common/components/IconText';
import JournalInfo from '../../common/components/JournalInfo';
import { LITERATURE } from '../../common/routes';

function getProceedingHref(recordId: any) {
  return `${LITERATURE}/${recordId}`;
}

function renderProceedingsDropdownAction(proceeding: any, index: any) {
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

function renderProceedingAction(proceeding: any, title: any) {
  const recordId = proceeding.get('control_number');
  return (
    <ExternalLink href={getProceedingHref(recordId)}>{title}</ExternalLink>
  );
}

// @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
const ACTION_TITLE = <IconText text="proceedings" icon={<BookOutlined />} />;

function ProceedingsAction({
  proceedings
}: any) {
  return (
    <ActionsDropdownOrAction
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      values={proceedings}
      renderAction={renderProceedingAction}
      renderDropdownAction={renderProceedingsDropdownAction}
      title={ACTION_TITLE}
    />
  );
}

ProceedingsAction.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  proceedings: PropTypes.instanceOf(List).isRequired,
};

export default ProceedingsAction;
