import React, { useCallback, useState, useRef } from 'react';
import { List } from 'immutable';

import ClientPaginatedList from '../../../common/components/ClientPaginatedList';
import FiguresCarousel from './FiguresCarousel';
import FigureListItem from './FigureListItem';
import EmptyOrChildren from '../../../common/components/EmptyOrChildren';

type OwnProps = {
    figures?: $TSFixMe; // TODO: PropTypes.instanceOf(List)
};

// @ts-expect-error ts-migrate(2565) FIXME: Property 'defaultProps' is used before being assig... Remove this comment to see the full error message
type Props = OwnProps & typeof Figures.defaultProps;

function Figures({ figures }: Props) {
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
          // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
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

Figures.defaultProps = {
  figures: List(),
};

export default Figures;
