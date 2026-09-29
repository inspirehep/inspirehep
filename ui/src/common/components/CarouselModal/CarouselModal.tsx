import React, {
  useCallback,
  useState,
  useMemo,
  MutableRefObject,
  PropsWithChildren,
  ReactNode,
  useRef,
} from 'react';
import Modal from 'react-modal';
import { Carousel, Row, Col, Button } from 'antd';

import './CarouselModal.less';
import { LeftOutlined, RightOutlined, CloseOutlined } from '@ant-design/icons';
import { useGlobalEvent } from '../../hooks/useGlobalEvent';
import useResponsiveCheck from '../../hooks/useResponsiveCheck';

interface CarouselModalProps {
  children: ReactNode;
  visible: boolean;
  onCancel: Function;
  initialIndex?: number;
}

const CarouselModal: React.FC<PropsWithChildren<CarouselModalProps>> = (
  props
) => {
  const { children, visible = false, onCancel, initialIndex = 0 } = props;

  const [carouselIndex, setCarouselIndex] = useState(0);

  const carouselRef = useRef(null);
  const isMobile = useResponsiveCheck({ max: 'md' });
  const rootElement = useMemo(() => document.getElementById('root'), []);
  const carouselLastIndex = React.Children.count(children) - 1;

  const onNextClick = useCallback(() => {
    (carouselRef as MutableRefObject<any>).current.next();
  }, [carouselRef]);

  const onPreviousClick = useCallback(() => {
    (carouselRef as MutableRefObject<any>).current.prev();
  }, [carouselRef]);

  const onCourselIndexChange = useCallback((_: number, newIndex: number) => {
    setCarouselIndex(newIndex);
  }, []);

  const onModalClose = useCallback(() => {
    onCancel();
  }, [onCancel]);

  const onModalContentClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      // HACK: close modal on click outside of real carousel content
      const clickOutOfCarouselTrack = event.target === event.currentTarget;
      const clickInCourselTrackButOutOfCurrentSlide = (
        event.target as HTMLElement
      ).classList.contains('slick-track');
      if (clickOutOfCarouselTrack || clickInCourselTrackButOutOfCurrentSlide) {
        onModalClose();
      }
    },
    [onModalClose]
  );

  useGlobalEvent('keydown', (event: KeyboardEvent) => {
    if (!visible) {
      return;
    }

    switch (event.key) {
      case 'ArrowLeft':
        onPreviousClick();
        break;
      case 'ArrowRight':
        onNextClick();
        break;
      case 'Tab':
        onNextClick();
        break;
      default:
        break;
    }
  });

  return (
    <>
      {rootElement && (
        <Modal
          appElement={rootElement}
          isOpen={visible || false} // TODO: animate on visibility change?
          className="__CarouselModal__ h-100"
          overlayClassName="__CarouselModal__overlay"
          bodyOpenClassName="__CarouselModal__body-open"
          onRequestClose={onModalClose}
          shouldCloseOnOverlayClick
          shouldCloseOnEsc
        >
          <Button
            className="action close"
            onClick={onModalClose}
            type="primary"
            size="large"
            icon={<CloseOutlined />}
          />
          {!isMobile && (
            <Button
              className="action previous"
              disabled={carouselIndex === 0}
              onClick={onPreviousClick}
              type="primary"
              size="large"
              icon={<LeftOutlined />}
            />
          )}
          <Row
            className="h-100"
            onClick={onModalContentClick}
            justify="center"
            align="middle"
          >
            <Col
              className="carousel-container"
              xs={24}
              md={20}
              lg={18}
              xxl={12}
            >
              <Carousel
                key={`${visible}-${initialIndex}`}
                className="carousel"
                infinite={false}
                ref={carouselRef}
                lazyLoad="progressive"
                adaptiveHeight
                initialSlide={initialIndex}
                beforeChange={onCourselIndexChange}
              >
                {children}
              </Carousel>
            </Col>
          </Row>
          {!isMobile && (
            <Button
              className="action next"
              disabled={carouselIndex === carouselLastIndex}
              onClick={onNextClick}
              type="primary"
              size="large"
              icon={<RightOutlined />}
            />
          )}
        </Modal>
      )}
    </>
  );
};

export default CarouselModal;
