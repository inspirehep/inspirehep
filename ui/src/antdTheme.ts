import type { ThemeConfig } from 'antd';
import styleVariables from './styleVariables';

const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: styleVariables['@primary-color'],
    colorLink: styleVariables['@link-color'],
    colorLinkHover: styleVariables['@link-hover-color'],
    colorText: styleVariables['@text-color'],
    colorTextHeading: styleVariables['@heading-color'],
    colorBorderSecondary: styleVariables['@border-color-split'],
    borderRadius: parseInt(styleVariables['@card-radius'], 10),
  },
};

export default antdTheme;
