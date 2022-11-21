import React, { useCallback, useState, useMemo, forwardRef, MutableRefObject, PropsWithChildren, ReactNode } from 'react';
import Modal from 'react-modal';
import { Carousel, Row, Col, Button } from 'antd';

import './CarouselModal.less';
import { LeftOutlined, RightOutlined, CloseOutlined } from '@ant-design/icons';
import useRefOrThis from '../../hooks/useRefOrThis';
import { useGlobalEvent } from '../../hooks/useGlobalEvent';
import useResponsiveCheck from '../../hooks/useResponsiveCheck';

interface CarouselModalProps {
  children: ReactNode;
  visible: boolean;
  onCancel: Function;
}

const CarouselModal: React.FC<PropsWithChildren<CarouselModalProps>> = forwardRef((props, ref) => {
    const { children, visible = false, onCancel } = props;

    const [carouselIndex, setCarouselIndex] = useState(0);

    const carouselRef = useRefOrThis(ref);
    const isMobile = useResponsiveCheck({ max: 'md' });
    const rootElement = useMemo(() => document.getElementById('root'), []);
    const carouselLastIndex = React.Children.count(children) - 1;

    const onNextClick = useCallback(() => {
      (carouselRef as MutableRefObject<any>).current.next();
    }, [carouselRef]);

    const onPreviousClick = useCallback(() => {
      (carouselRef as MutableRefObject<any>).current.prev();
    }, [carouselRef]);

    const onCourselIndexChange = useCallback((_, newIndex) => {
      setCarouselIndex(newIndex);
    }, []);

    const onModalClose = useCallback(() => {
      onCancel();
      (carouselRef as MutableRefObject<any>).current.goTo(0, true);
      setCarouselIndex(0); // `beforeChange` is not triggered for `goTo`
    }, [onCancel, carouselRef]);

    const onModalContentClick = useCallback(
      (event) => {
        // HACK: close modal on click outside of real carousel content
        const clickOutOfCarouselTrack = event.target === event.currentTarget;
        const clickInCourselTrackButOutOfCurrentSlide =
          event.target.classList.contains('slick-track');
        if (
          clickOutOfCarouselTrack ||
          clickInCourselTrackButOutOfCurrentSlide
        ) {
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
            isOpen={visible} // TODO: animate on visibility change?
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
                  className="carousel"
                  infinite={false}
                  ref={carouselRef}
                  lazyLoad="progressive"
                  adaptiveHeight
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
  }
);

CarouselModal.displayName = 'CarouselModal';

export default CarouselModal;
