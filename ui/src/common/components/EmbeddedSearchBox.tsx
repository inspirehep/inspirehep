import React from 'react';
import { Input } from 'antd';

type Props = {
    onSearch: $TSFixMeFunction;
    placeholder?: string;
};

function EmbeddedSearchBox({ onSearch, placeholder }: Props) {
  return (
    <Input.Search enterButton onSearch={onSearch} placeholder={placeholder} />
  );
}

export default EmbeddedSearchBox;
