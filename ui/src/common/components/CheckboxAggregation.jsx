import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import { List, Tag } from 'antd';

import CheckboxItem from './CheckboxItem';

class CheckboxAggregation extends Component {
  static getDerivedStateFromProps(nextProps, prevState) {
    // TODO: perform conditionally
    let selectionMap;
    if (nextProps.selections) {
      selectionMap = nextProps.selections
        .reduce((map, key) => map.set(key, true), Immutable.Map());
    } else {
      selectionMap = Immutable.Map();
    }

    return {
      ...prevState,
      selectionMap,
    };
  }

  constructor(props) {
    super(props);
    this.state = { selectionMap: Immutable.Map() };
  }

  onSelectionChange(key, selected) {
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
                  onChange={(checked) => { this.onSelectionChange(bucket.get('key'), checked); }}
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

CheckboxAggregation.propTypes = {
  onChange: PropTypes.func.isRequired,
  buckets: PropTypes.instanceOf(Immutable.List).isRequired,
  name: PropTypes.string.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  selections: PropTypes.arrayOf(PropTypes.string).isRequired,
};


export default CheckboxAggregation;
