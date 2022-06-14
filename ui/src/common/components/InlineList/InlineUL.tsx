import React, { Component } from 'react';
import PropTypes from 'prop-types';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'clas... Remove this comment to see the full error message
import classnames from 'classnames';
import './InlineList.scss';
import { SEPARATOR_TYPES, DEFAULT_SEPARATOR_TYPE } from './constants';

class InlineUL extends Component {
  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'separator' does not exist on type 'Reado... Remove this comment to see the full error message
    const { children, separator, wrapperClassName } = this.props;
    return (
      <div className={classnames('__InlineList__', wrapperClassName)}>
        <ul>
          {React.Children.toArray(children).map(
            (child, index, array) =>
              child && (
                // @ts-expect-error ts-migrate(2339) FIXME: Property 'key' does not exist on type 'ReactChild ... Remove this comment to see the full error message
                <li key={child.key}>
                  {child}
                  {index < array.length - 1 && separator}
                </li>
              )
          )}
        </ul>
      </div>
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
InlineUL.propTypes = {
  children: PropTypes.node.isRequired,
  separator: PropTypes.oneOf(SEPARATOR_TYPES),
  wrapperClassName: PropTypes.string,
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
InlineUL.defaultProps = {
  separator: DEFAULT_SEPARATOR_TYPE,
  wrapperClassName: null,
};

export default InlineUL;
