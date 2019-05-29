import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import './InlineList.scss';
import {
  SEPARATE_ITEMS_CLASSNAMES,
  DEFAULT_SEPARATE_ITEMS_CLASS,
} from './constants';

class InlineUL extends Component {
  render() {
    const { children, separateItemsClassName, wrapperClassName } = this.props;
    return (
      <div className={classnames('__InlineList__', wrapperClassName)}>
        <ul className={separateItemsClassName}>
          {React.Children.map(children, child => <li>{child}</li>)}
        </ul>
      </div>
    );
  }
}

InlineUL.propTypes = {
  children: PropTypes.node.isRequired,
  separateItemsClassName: PropTypes.oneOf(SEPARATE_ITEMS_CLASSNAMES),
  wrapperClassName: PropTypes.string,
};

InlineUL.defaultProps = {
  separateItemsClassName: DEFAULT_SEPARATE_ITEMS_CLASS,
  wrapperClassName: null,
};

export default InlineUL;
