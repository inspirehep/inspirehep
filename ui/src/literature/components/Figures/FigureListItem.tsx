import React from 'react';
import { List } from 'antd';
import { Map } from 'immutable';

import Figure from './Figure';

type Props = {
    figure: $TSFixMe; // TODO: PropTypes.instanceOf(Map)
    onClick: $TSFixMeFunction;
};

function FigureListItem({ figure, onClick }: Props) {
  return (
    <List.Item>
      <Figure className="mhi5" onClick={onClick} url={figure.get('url')} />
    </List.Item>
  );
}

export default FigureListItem;
