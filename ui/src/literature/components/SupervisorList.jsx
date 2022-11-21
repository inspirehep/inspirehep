import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import InlineDataList from '../../common/components/InlineList';
import Author from '../../common/components/Author';
import { pluralizeUnlessSingle } from '../../common/utils';

function renderSupervisor(supervisor, page) {
  return <Author author={supervisor} page={page} />;
}

function extractKeyFromSupervisor(supervisor) {
  return supervisor.get('uuid');
}

function SupervisorList({ supervisors, page }) {
  return (
    <InlineDataList
      label={pluralizeUnlessSingle(
        'Supervisor',
        supervisors && supervisors.size
      )}
      items={supervisors}
      extractKey={extractKeyFromSupervisor}
      renderItem={(supervisor) => renderSupervisor(supervisor, page)}
    />
  );
}

SupervisorList.propTypes = {
  supervisors: PropTypes.instanceOf(List),
};

SupervisorList.defaultProps = {
  supervisors: null,
};

export default SupervisorList;
