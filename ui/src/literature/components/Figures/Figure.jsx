import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Image from 'react-image';
import { Spin } from 'antd';
import { FileImageOutlined } from '@ant-design/icons';

import './Figure.scss';
import Latex from '../../../common/components/Latex';

const ICON_STYLE = { margin: 'auto', display: 'block', padding: '2rem 0' };
const LOADER = <Spin style={ICON_STYLE} />;
const UNLOADER = <FileImageOutlined className="f2" style={ICON_STYLE} />;

function Figure({ url, className, onClick, caption }) {
  return (
    <div className="__Figure__ bg-white pa3">
      <figure className="mv1">
        <Image
          onClick={onClick}
          className={classNames(className, 'ba pa1 db center w-auto h-auto', {
            pointer: onClick,
          })}
          src={url}
          alt="Figure"
          loader={LOADER}
          unloader={UNLOADER}
        />
        {caption && (
          <figcaption className="mt3">
            <Latex>{caption}</Latex>
          </figcaption>
        )}
      </figure>
    </div>
  );
}

Figure.propTypes = {
  url: PropTypes.string.isRequired,
  className: PropTypes.string,
  onClick: PropTypes.func,
  caption: PropTypes.string,
};

export default Figure;
