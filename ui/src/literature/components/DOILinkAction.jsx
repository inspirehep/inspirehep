import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import { LinkOutlined } from '@ant-design/icons';

import IconText from '../../common/components/IconText';
import DOILink from './DOILink';
import DOIMaterial from './DOIMaterial';
import ActionsDropdownOrAction from '../../common/components/ActionsDropdownOrAction';

function renderDOIDropdownAction(doi, page) {
  return {
    key: doi.get('value'),
    label: (
      <span key={doi.get('value')}>
        <DOILink doi={doi.get('value')} page={page}>
          {doi.get('value')}
          <DOIMaterial material={doi.get('material')} />
        </DOILink>
      </span>
    ),
  };
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
