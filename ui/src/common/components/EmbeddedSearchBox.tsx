import React from 'react';
import { Input } from 'antd';

function EmbeddedSearchBox({
  onSearch,
  placeholder,
}: {
  onSearch: (value: string, event?: any) => void;
  placeholder?: string;
}) {
  return (
    <Input.Search enterButton onSearch={onSearch} placeholder={placeholder} />
  );
}

export default EmbeddedSearchBox;
