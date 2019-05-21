import PropTypes from 'prop-types';
import { Map } from 'immutable';

export const NullPropType = (props, propName) => props[propName] === null;
export const ErrorPropType = PropTypes.oneOfType([
  NullPropType,
  PropTypes.instanceOf(Map),
]);

export const SelectOptionsPropType = PropTypes.arrayOf(
  PropTypes.shape({
    value: PropTypes.string.isRequired,
    display: PropTypes.string,
  })
);
