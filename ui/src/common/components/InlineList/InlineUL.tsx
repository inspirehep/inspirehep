import React, { Component } from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'clas... Remove this comment to see the full error message
import classnames from 'classnames';
import './InlineList.scss';
import { SEPARATOR_TYPES, DEFAULT_SEPARATOR_TYPE } from './constants';

type OwnProps = {
    separator?: $TSFixMe; // TODO: PropTypes.oneOf(SEPARATOR_TYPES)
    wrapperClassName?: string;
};

type Props = OwnProps & typeof InlineUL.defaultProps;

class InlineUL extends Component<Props> {

static defaultProps = {
    separator: DEFAULT_SEPARATOR_TYPE,
    wrapperClassName: null,
};

  render() {
    const { children, separator, wrapperClassName } = this.props;
    return (<div className={classnames('__InlineList__', wrapperClassName)}>
        <ul>
          {React.Children.toArray(children).map((child, index, array) => child && (<li key={(child as $TSFixMe).key}>
                  {child}
                  {index < array.length - 1 && separator}
                </li>))}
        </ul>
      </div>);
  }
}

export default InlineUL;
