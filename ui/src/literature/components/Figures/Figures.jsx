import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import ClientPaginatedList from '../../../common/components/ClientPaginatedList';
import FiguresCarousel from './FiguresCarousel';
import FigureListItem from './FigureListItem';
import EmptyOrChildren from '../../../common/components/EmptyOrChildren';

function Figures({ figures = List() }) {
  const [isCarouselVisible, setCarouselVisible] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);

  const onCarouselCancel = useCallback(
    () => setCarouselVisible(false),
    [setCarouselVisible]
  );

  const renderListItem = useCallback(
    (figure, index) => (
      <FigureListItem
        key={figure.get('key')}
        figure={figure}
        onClick={() => {
          setInitialIndex(index);
          setCarouselVisible(true);
        }}
        testId={`figure-${index}`}
      />
    ),
    []
  );

  return (
    <EmptyOrChildren data={figures} title="0 Figures">
      <ClientPaginatedList
        items={figures}
        renderItem={renderListItem}
        pageSize={12}
        grid
      />
      <FiguresCarousel
        figures={figures}
        visible={isCarouselVisible}
        initialIndex={initialIndex}
        onCancel={onCarouselCancel}
      />
    </EmptyOrChildren>
  );
}

Figures.propTypes = {
  figures: PropTypes.instanceOf(List),
};

export default Figures;
