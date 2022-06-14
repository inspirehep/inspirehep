import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';

function EmbeddedSearchBox({ onSearch, placeholder }) {
  return (
    <Input.Search enterButton onSearch={onSearch} placeholder={placeholder} />
  );
}

EmbeddedSearchBox.propTypes = {
  onSearch: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};

export default EmbeddedSearchBox;
