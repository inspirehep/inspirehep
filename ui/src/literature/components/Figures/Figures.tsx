import React, { useCallback, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import ClientPaginatedList from '../../../common/components/ClientPaginatedList';
import FiguresCarousel from './FiguresCarousel';
import FigureListItem from './FigureListItem';
import EmptyOrChildren from '../../../common/components/EmptyOrChildren';

function Figures({
  figures
}: any) {
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
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    <EmptyOrChildren data={figures} title="0 Figures">
      <ClientPaginatedList
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ items: any; renderItem: (figure: any, inde... Remove this comment to see the full error message
        items={figures}
        renderItem={renderListItem}
        pageSize={12}
        grid
      />
      <FiguresCarousel
        ref={carouselRef}
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ ref: MutableRefObject<undefined>; figures:... Remove this comment to see the full error message
        figures={figures}
        visible={isCarouselVisible}
        onCancel={onCarouselCancel}
      />
    </EmptyOrChildren>
  );
}

Figures.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  figures: PropTypes.instanceOf(List),
};

Figures.defaultProps = {
  figures: List(),
};

export default Figures;
