import PropTypes from 'prop-types';
import { Map } from 'immutable';

export const NullPropType = (props: any, propName: any) => props[propName] === null;

// TODO: unify error type in the codebase by removing `Map` type
// TODO: refactor components that expect `Map` type error prop.
export const ErrorPropType = PropTypes.oneOfType([
  // @ts-expect-error ts-migrate(2322) FIXME: Type '(props: any, propName: any) => boolean' is n... Remove this comment to see the full error message
  NullPropType,
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof Map' is not assignable to... Remove this comment to see the full error message
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
