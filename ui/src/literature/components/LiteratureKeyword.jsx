import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Tag } from 'antd';
import { Map } from 'immutable';

import { LITERATURE } from '../../common/routes';

class LiteratureKeyword extends Component {
  render() {
    const { keyword } = this.props;
    const value = keyword.get('value');
    // TODO: fix the query
    const keywordSearchLink = `${LITERATURE}/?q=keyword:"${value}"`;
    return (
      <Tag color="blue" style={{ marginTop: 4 }}>
        <Link to={keywordSearchLink}>{keyword.get('value')}</Link>
      </Tag>
    );
  }
}

LiteratureKeyword.propTypes = {
  keyword: PropTypes.instanceOf(Map).isRequired,
};

export default LiteratureKeyword;
