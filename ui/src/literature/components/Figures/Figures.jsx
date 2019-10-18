import React, { useCallback, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import ClientPaginatedList from '../../../common/components/ClientPaginatedList';
import FiguresCarousel from './FiguresCarousel';
import FigureListItem from './FigureListItem';
import EmptyOrChildren from '../../../common/components/EmptyOrChildren';

function Figures({ figures }) {
  const [isCarouselVisible, setCarouselVisible] = useState(false);
  const carouselRef = useRef();

  const onCarouselCancel = useCallback(() => setCarouselVisible(false), [
    setCarouselVisible,
  ]);

  const renderListItem = useCallback(
    (figure, index) => (
      <FigureListItem
        key={figure.get('key')}
        figure={figure}
        // TODO: use useCallback for onClick
        onClick={() => {
          setCarouselVisible(true);
          // wait for the carousel to be in dom
          setTimeout(() => carouselRef.current.goTo(index, false));
        }}
      />
    ),
    []
  );

  return (
    <EmptyOrChildren data={figures} description="0 Figures">
      <ClientPaginatedList
        items={figures}
        renderItem={renderListItem}
        pageSize={12}
        grid
      />
      <FiguresCarousel
        carouselRef={carouselRef}
        figures={figures}
        visible={isCarouselVisible}
        onCancel={onCarouselCancel}
      />
    </EmptyOrChildren>
  );
}

Figures.propTypes = {
  figures: PropTypes.instanceOf(List),
};

Figures.defaultProps = {
  figures: null,
};

export default Figures;
