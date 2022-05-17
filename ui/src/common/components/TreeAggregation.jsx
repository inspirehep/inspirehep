import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { List, setIn } from 'immutable';
import { Col, Row, Tree } from 'antd';

import UnclickableTag from './UnclickableTag';
import AggregationBox from './AggregationBox';
import { forceArray } from '../utils';
import FormattedNumber from './FormattedNumber';

function renderTitle(name, docCount) {
  return (
    <Row className="mv1" justify="space-between" key={name}>
      <Col>{name}</Col>
      <Col>
        <UnclickableTag>
          <FormattedNumber>{docCount}</FormattedNumber>
        </UnclickableTag>
      </Col>
    </Row>
  );
}

function buildTreeData(buckets, splitTreeBy) {
  let tree = {};
  buckets.forEach(bucket => {
    const docCount = bucket.get('doc_count');
    const key = bucket.get('key');
    // convert to list just for `flatMap`, since Array.prototype.flatMap needs to be polyfilled
    // a|b|c => turns into [children, a, children, b, children, c] (the path of the node)
    const path = List(key.split(splitTreeBy)).flatMap(node => [
      'children',
      node,
    ]);

    tree = setIn(tree, path.push('title'), renderTitle(path.last(), docCount));
    tree = setIn(tree, path.push('key'), key);
  });

  function convertChildrenToArray(node) {
    if (node.children) {
      node.children = Object.values(node.children);
      node.children.forEach(convertChildrenToArray);
    }
  }

  // because above needs and builds a tree where node.children is an object
  convertChildrenToArray(tree);
  return tree.children;
}

function TreeAggregation({ onChange, buckets, name, selections, splitTreeBy }) {
  const [selectedKeys] = useState(forceArray(selections));

  const tree = useMemo(() => buildTreeData(buckets, splitTreeBy), [
    buckets,
    splitTreeBy,
  ]);

  return (
    <AggregationBox name={name}>
      <Tree
        blockNode
        checkable
        checkStrictly
        checkedKeys={selectedKeys}
        onCheck={event => onChange(event.checked)}
        selectable={false}
        treeData={tree}
        defaultExpandedKeys={selectedKeys}
      />
    </AggregationBox>
  );
}

TreeAggregation.propTypes = {
  onChange: PropTypes.func.isRequired,
  buckets: PropTypes.instanceOf(List).isRequired,
  name: PropTypes.string.isRequired,
  selections: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string,
  ]),
  splitTreeBy: PropTypes.string.isRequired,
};

TreeAggregation.defaultProps = {
  selections: [],
};

export default TreeAggregation;
