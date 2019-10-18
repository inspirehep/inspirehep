import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'antd';
import { Map } from 'immutable';

import Figure from './Figure';

function FigureListItem({ figure, onClick }) {
  return (
    <List.Item>
      <Figure
        className="h5 db center pointer"
        onClick={onClick}
        figure={figure}
      />
    </List.Item>
  );
}

FigureListItem.propTypes = {
  figure: PropTypes.instanceOf(Map).isRequired,
  onClick: PropTypes.func.isRequired,
};

export default FigureListItem;
