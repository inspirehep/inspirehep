import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import { Menu } from 'antd';
import { LinkOutlined } from '@ant-design/icons';

import IconText from '../../common/components/IconText';
import DOILink from './DOILink';
import DOIMaterial from './DOIMaterial';
import ActionsDropdownOrAction from '../../common/components/ActionsDropdownOrAction';

function renderDOIDropdownAction(doi) {
  return (
    <Menu.Item key={doi.get('value')}>
      <DOILink doi={doi.get('value')}>
        {doi.get('value')}
        <DOIMaterial material={doi.get('material')} />
      </DOILink>
    </Menu.Item>
  );
}

function renderDOIAction(doi, title) {
  return <DOILink doi={doi.get('value')}>{title}</DOILink>;
}

const TITLE = <IconText text="DOI" icon={<LinkOutlined />} />;

function DOILinkAction({ dois }) {
  return (
    <ActionsDropdownOrAction
      values={dois}
      renderAction={renderDOIAction}
      renderDropdownAction={renderDOIDropdownAction}
      title={TITLE}
    />
  );
}

DOILinkAction.propTypes = {
  dois: PropTypes.instanceOf(List).isRequired,
};

export default DOILinkAction;
