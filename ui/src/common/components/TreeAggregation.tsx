import React, { useState, useMemo } from 'react';
import { List, setIn } from 'immutable';
import { Col, Row, Tree } from 'antd';

import UnclickableTag from './UnclickableTag';
import AggregationBox from './AggregationBox';
import { forceArray } from '../utils';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import FormattedNumber from './FormattedNumber.tsx';

function renderTitle(name: $TSFixMe, docCount: $TSFixMe) {
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

function buildTreeData(buckets: $TSFixMe, splitTreeBy: $TSFixMe) {
  let tree = {};
  buckets.forEach((bucket: $TSFixMe) => {
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

  function convertChildrenToArray(node: $TSFixMe) {
    if (node.children) {
      node.children = Object.values(node.children);
      node.children.forEach(convertChildrenToArray);
    }
  }

  // because above needs and builds a tree where node.children is an object
  convertChildrenToArray(tree);
  return (tree as $TSFixMe).children;
}

type OwnProps = {
    onChange: $TSFixMeFunction;
    buckets: $TSFixMe; // TODO: PropTypes.instanceOf(List)
    name: string;
    selections?: string[] | string;
    splitTreeBy: string;
};

// @ts-expect-error ts-migrate(2565) FIXME: Property 'defaultProps' is used before being assig... Remove this comment to see the full error message
type Props = OwnProps & typeof TreeAggregation.defaultProps;

function TreeAggregation({ onChange, buckets, name, selections, splitTreeBy }: Props) {
  const [selectedKeys] = useState(forceArray(selections));

  const tree = useMemo(() => buildTreeData(buckets, splitTreeBy), [
    buckets,
    splitTreeBy,
  ]);

  return (<AggregationBox name={name}>
      {/* @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call. */}
      <Tree blockNode checkable checkStrictly checkedKeys={selectedKeys} onCheck={event => onChange((event as $TSFixMe).checked)} selectable={false} treeData={tree} defaultExpandedKeys={selectedKeys}/>
    </AggregationBox>);
}

TreeAggregation.defaultProps = {
  selections: [],
};

export default TreeAggregation;
