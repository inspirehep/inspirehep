import PropTypes from 'prop-types';

import { getConfigFor } from '../config';

function RequireFeatureFlag({ flag, children }) {
  const isEnabled = getConfigFor(flag);
  return isEnabled ? children : null;
}

RequireFeatureFlag.propTypes = {
  flag: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default RequireFeatureFlag;
