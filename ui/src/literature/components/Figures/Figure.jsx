import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Image from 'react-image';
import { Spin } from 'antd';
import { Map } from 'immutable';

import './Figure.scss';

function Figure({ figure, className, onClick }) {
  return (
    <div className="__Figure__">
      <div className="image-container ba mh3">
        <Image
          onClick={onClick}
          className={classNames(className, 'pa1')}
          src={figure.get('url')}
          loader={
            <Spin
              style={{ margin: 'auto', display: 'block', padding: '2rem 0' }}
            />
          }
        />
      </div>
      <div className="tc pt1">
        <h4>{figure.get('label') || 'No Legend'}</h4>
      </div>
    </div>
  );
}

Figure.propTypes = {
  figure: PropTypes.instanceOf(Map).isRequired,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

export default Figure;
