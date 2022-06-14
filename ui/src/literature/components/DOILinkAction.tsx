import React from 'react';
import { List } from 'immutable';
import { Menu } from 'antd';
import { LinkOutlined } from '@ant-design/icons';

import IconText from '../../common/components/IconText';
import DOILink from './DOILink';
import DOIMaterial from './DOIMaterial';
import ActionsDropdownOrAction from '../../common/components/ActionsDropdownOrAction';

function renderDOIDropdownAction(doi: $TSFixMe) {
  return (
    <Menu.Item key={doi.get('value')}>
      <DOILink doi={doi.get('value')}>
        {doi.get('value')}
        {/* @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call. */}
        <DOIMaterial material={doi.get('material')} />
      </DOILink>
    </Menu.Item>
  );
}

function renderDOIAction(doi: $TSFixMe, title: $TSFixMe) {
  return <DOILink doi={doi.get('value')}>{title}</DOILink>;
}

const TITLE = <IconText text="DOI" icon={<LinkOutlined />} />;

type Props = {
    dois: $TSFixMe; // TODO: PropTypes.instanceOf(List)
};

function DOILinkAction({ dois }: Props) {
  return (
    <ActionsDropdownOrAction
      values={dois}
      renderAction={renderDOIAction}
      renderDropdownAction={renderDOIDropdownAction}
      title={TITLE}
    />
  );
}

export default DOILinkAction;
