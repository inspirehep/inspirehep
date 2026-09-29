import PropTypes from 'prop-types';
import { List } from 'antd';
import { Map } from 'immutable';

import Figure from './Figure';

function FigureListItem({ figure, onClick, testId }) {
  return (
    <List.Item>
      <Figure
        className="mhi5"
        onClick={onClick}
        url={figure.get('url')}
        testId={testId}
      />
    </List.Item>
  );
}

FigureListItem.propTypes = {
  figure: PropTypes.instanceOf(Map).isRequired,
  onClick: PropTypes.func.isRequired,
  testId: PropTypes.string,
};

export default FigureListItem;
