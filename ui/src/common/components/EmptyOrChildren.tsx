import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List, Map } from 'immutable';
import { Empty } from 'antd';

function isEmptyCollection(data: any) {
  return (
    data != null &&
    (Object.keys(data).length === 0 || // object/array
      data.size === 0) // Map/List
  );
}

class EmptyOrChildren extends Component {
  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'data' does not exist on type 'Readonly<{... Remove this comment to see the full error message
    const { data, children, title, description } = this.props;
    return isEmptyCollection(data) ? (
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={title}>
        {description}
      </Empty>
    ) : (
      children
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
EmptyOrChildren.propTypes = {
  data: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
    PropTypes.instanceOf(List),
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof Map' is not assignable to... Remove this comment to see the full error message
    PropTypes.instanceOf(Map),
  ]),
  title: PropTypes.string,
  description: PropTypes.node,
  children: PropTypes.node,
};

export default EmptyOrChildren;
