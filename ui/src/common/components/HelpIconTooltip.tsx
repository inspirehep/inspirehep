import React from 'react';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

const HelpIconTooltip = ({ help }: { help: string | JSX.Element }) => (
  <Tooltip title={help}>
    <QuestionCircleOutlined />
  </Tooltip>
);

HelpIconTooltip.defaultProps = {
  help: null,
};

export default HelpIconTooltip;
