import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import InlineList from '../../common/components/InlineList';
import Author from '../../common/components/Author';
import pluralizeUnlessSingle from '../../common/utils';

function renderSupervisor(supervisor: any) {
  // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
  return <Author author={supervisor} />;
}

function extractKeyFromSupervisor(supervisor: any) {
  return supervisor.get('uuid');
}

function SupervisorList({
  supervisors
}: any) {
  return (
    <InlineList
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      label={pluralizeUnlessSingle(
        'Supervisor',
        supervisors && supervisors.size
      )}
      items={supervisors}
      extractKey={extractKeyFromSupervisor}
      renderItem={renderSupervisor}
    />
  );
}

SupervisorList.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  supervisors: PropTypes.instanceOf(List),
};

SupervisorList.defaultProps = {
  supervisors: null,
};

export default SupervisorList;
