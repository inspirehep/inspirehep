import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import { List, Tag } from 'antd';

import CheckboxItem from './CheckboxItem';

class AggregationFilter extends Component {
  static getDerivedStateFromProps(nextProps, prevState) {
    const selectionMap = nextProps.selectedKeys
      .reduce((map, key) => map.set(key, true), Immutable.Map());

    return {
      ...prevState,
      selectionMap,
    };
  }

  constructor(props) {
    super(props);
    this.state = { selectionMap: Immutable.Map() };
  }

  onBucketChange(key, selected) {
    let { selectionMap } = this.state;
    selectionMap = selectionMap.set(key, selected);
    this.setState({ selectionMap }); // TODO: really needed?
    const selections = selectionMap.keySeq()
      .filter(bucketKey => selectionMap.get(bucketKey))
      .toArray();
    this.props.onChange(selections);
  }

  render() {
    return (
      <div style={{ width: '100%' }}>
        <List header={<strong>{this.props.name}</strong>}>
          {this.props.buckets.map(bucket => (
            <List.Item key={bucket.get('key')}>
              <List.Item.Meta title={
                <CheckboxItem
                  checked={this.state.selectionMap.get(bucket.get('key'))}
                  onChange={(checked) => { this.onBucketChange(bucket.get('key'), checked); }}
                >
                  {bucket.get('key')}
                </CheckboxItem>
              }
              />
              <Tag>
                {bucket.get('doc_count')}
              </Tag>
            </List.Item>
          ))}
        </List>
      </div>
    );
  }
}

AggregationFilter.propTypes = {
  onChange: PropTypes.func.isRequired,
  buckets: PropTypes.instanceOf(Immutable.List).isRequired,
  name: PropTypes.string.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  selectedKeys: PropTypes.arrayOf(PropTypes.string),
};

AggregationFilter.defaultProps = {
  selectedKeys: [],
};

export default AggregationFilter;
