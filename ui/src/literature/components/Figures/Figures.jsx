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
        onClick={() => {
          setCarouselVisible(true);
          // TODO: setTimeout only if needed
          // wait for the carousel to be in dom
          setTimeout(() => carouselRef.current.goTo(index, true));
        }}
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
        ref={carouselRef}
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
  figures: List(),
};

export default Figures;
