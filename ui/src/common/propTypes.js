import PropTypes from 'prop-types';
import { Map } from 'immutable';

export const NullPropType = (props, propName) => props[propName] === null;
export const ErrorPropType = PropTypes.oneOfType([
  NullPropType,
  PropTypes.instanceOf(Map),
]);
