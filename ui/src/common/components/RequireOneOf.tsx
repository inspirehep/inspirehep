import { useMemo } from 'react';
import PropTypes from 'prop-types';

function isPresent(value) {
  return value != null && value !== '';
}

function RequireOneOf({ dependencies, children }) {
  const isAtLeastOnePresent = useMemo(() => dependencies.some(isPresent), [
    dependencies,
  ]);
  return isAtLeastOnePresent ? children : null;
}

RequireOneOf.propTypes = {
  dependencies: PropTypes.array.isRequired,
  children: PropTypes.node.isRequired,
};

export default RequireOneOf;
