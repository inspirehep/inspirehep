import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import { Menu } from 'antd';
import { LinkOutlined } from '@ant-design/icons';

import IconText from '../../common/components/IconText';
import DOILink from './DOILink';
import DOIMaterial from './DOIMaterial';
import ActionsDropdownOrAction from '../../common/components/ActionsDropdownOrAction';

function renderDOIDropdownAction(doi: any) {
  return (
    <Menu.Item key={doi.get('value')}>
      {/* @ts-ignore */}
      <DOILink doi={doi.get('value')}>
        {doi.get('value')}
        {/* @ts-ignore */}
        <DOIMaterial material={doi.get('material')} />
      </DOILink>
    </Menu.Item>
  );
}

function renderDOIAction(doi: any, title: any) {
  // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
  return <DOILink doi={doi.get('value')}>{title}</DOILink>;
}

// @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
const TITLE = <IconText text="DOI" icon={<LinkOutlined />} />;

function DOILinkAction({
  dois
}: any) {
  return (
    <ActionsDropdownOrAction
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      values={dois}
      renderAction={renderDOIAction}
      renderDropdownAction={renderDOIDropdownAction}
      title={TITLE}
    />
  );
}

DOILinkAction.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  dois: PropTypes.instanceOf(List).isRequired,
};

export default DOILinkAction;
