import React from 'react';
import { List } from 'immutable';

import InlineList from '../../common/components/InlineList';
import Author from '../../common/components/Author';
import pluralizeUnlessSingle from '../../common/utils';

function renderSupervisor(supervisor: $TSFixMe) {
  return <Author author={supervisor} />;
}

function extractKeyFromSupervisor(supervisor: $TSFixMe) {
  return supervisor.get('uuid');
}

type OwnProps = {
    supervisors?: $TSFixMe; // TODO: PropTypes.instanceOf(List)
};

// @ts-expect-error ts-migrate(2565) FIXME: Property 'defaultProps' is used before being assig... Remove this comment to see the full error message
type Props = OwnProps & typeof SupervisorList.defaultProps;

function SupervisorList({ supervisors }: Props) {
  return (
    <InlineList
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

SupervisorList.defaultProps = {
  supervisors: null,
};

export default SupervisorList;
