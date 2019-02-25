import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tag } from 'antd';
import { Map } from 'immutable';

import './LiteratureKeyword.scss';

class LiteratureKeyword extends Component {
  render() {
    const { keyword } = this.props;
    const keywordValue = keyword.get('value');

    return (
      <Tag className="__LiteratureKeyword__" color="blue">
        {keywordValue}
      </Tag>
    );
  }
}

LiteratureKeyword.propTypes = {
  keyword: PropTypes.instanceOf(Map).isRequired,
};

export default LiteratureKeyword;
