import React, { Component } from 'react';
import { Card, List } from 'antd';
import PropTypes from 'prop-types';

class CategoryCard extends Component {
  render() {
    const { title, categoryCount } = this.props;
    return (
      <Card title={title} style={{ width: 300 }}>
        <List
          bordered
          dataSource={Object.keys(categoryCount)}
          renderItem={item => (
            <List.Item>
              {item} - {categoryCount[item]}
            </List.Item>
          )}
        />
      </Card>
    );
  }
}

CategoryCard.propTypes = {
  title: PropTypes.string,
  categoryCount: PropTypes.objectOf(PropTypes.number),
};

CategoryCard.defaultProps = {
  title: null,
  categoryCount: {},
};

export default CategoryCard;
