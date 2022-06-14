import PropTypes from 'prop-types';
import { Map } from 'immutable';

export const NullPropType = (props, propName) => props[propName] === null;

// TODO: unify error type in the codebase by removing `Map` type
// TODO: refactor components that expect `Map` type error prop.
export const ErrorPropType = PropTypes.oneOfType([
  NullPropType,
  PropTypes.instanceOf(Map),
  PropTypes.shape({
    message: PropTypes.string,
  }),
]);

export const SelectOptionsPropType = PropTypes.arrayOf(
  PropTypes.shape({
    value: PropTypes.string.isRequired,
    display: PropTypes.string,
  })
);
