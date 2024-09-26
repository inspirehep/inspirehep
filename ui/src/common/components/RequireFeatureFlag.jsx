import PropTypes from 'prop-types';

import { getConfigFor } from '../config';

function RequireFeatureFlag({ flag, children, whenDisabled = null }) {
  const isEnabled = getConfigFor(flag);
  return isEnabled ? children : whenDisabled;
}

RequireFeatureFlag.propTypes = {
  flag: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  whenDisabled: PropTypes.node,
};

export default RequireFeatureFlag;
