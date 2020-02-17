import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Image from 'react-image';
import { Spin } from 'antd';

import './Figure.scss';

function Figure({ url, className, onClick }) {
  return (
    <div className="__Figure__">
      <div className="image-container mh3 ba">
        <Image
          onClick={onClick}
          className={classNames(className, 'pa1 db center w-auto h-auto', {
            pointer: onClick,
          })}
          src={url}
          loader={
            <Spin
              style={{ margin: 'auto', display: 'block', padding: '2rem 0' }}
            />
          }
        />
      </div>
    </div>
  );
}

Figure.propTypes = {
  url: PropTypes.string.isRequired,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

export default Figure;
