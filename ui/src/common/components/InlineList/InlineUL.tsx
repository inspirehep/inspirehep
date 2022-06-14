import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import './InlineList.scss';
import { SEPARATOR_TYPES, DEFAULT_SEPARATOR_TYPE } from './constants';

class InlineUL extends Component {
  render() {
    const { children, separator, wrapperClassName } = this.props;
    return (
      <div className={classnames('__InlineList__', wrapperClassName)}>
        <ul>
          {React.Children.toArray(children).map(
            (child, index, array) =>
              child && (
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

InlineUL.propTypes = {
  children: PropTypes.node.isRequired,
  separator: PropTypes.oneOf(SEPARATOR_TYPES),
  wrapperClassName: PropTypes.string,
};

InlineUL.defaultProps = {
  separator: DEFAULT_SEPARATOR_TYPE,
  wrapperClassName: null,
};

export default InlineUL;
