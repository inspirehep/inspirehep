import React, { Component } from 'react';
import { List } from 'antd';
import PropTypes from 'prop-types';

class EntryList extends Component {
  render() {
    const { title, entries } = this.props;
    return (
      <List
        header={<h4>{title}</h4>}
        bordered
        dataSource={entries}
        renderItem={([key, value]) => (
          <List.Item>
            {key} - {value}
          </List.Item>
        )}
      />
    );
  }
}

EntryList.propTypes = {
  title: PropTypes.string,
  entries: PropTypes.arrayOf(PropTypes.array),
};

EntryList.defaultProps = {
  title: null,
  entries: [],
};

export default EntryList;
