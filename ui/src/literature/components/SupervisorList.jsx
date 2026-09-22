import PropTypes from 'prop-types';
import { List } from 'immutable';

import InlineDataList from '../../common/components/InlineList';
import Author from '../../common/components/Author';
import { pluralizeUnlessSingle } from '../../common/utils';

function renderSupervisor(supervisor) {
  return <Author author={supervisor} />;
}

function extractKeyFromSupervisor(supervisor) {
  return supervisor.get('uuid');
}

function SupervisorList({ supervisors }) {
  return (
    <InlineDataList
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
  supervisors: PropTypes.instanceOf(List),
};

export default SupervisorList;
