import React, { useCallback, useState, useMemo, forwardRef } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import { Carousel, Row, Col, Button } from 'antd';

import './CarouselModal.scss';
import { LeftOutlined, RightOutlined, CloseOutlined } from '@ant-design/icons';
import useRefOrThis from '../../hooks/useRefOrThis';
import { useGlobalEvent } from '../../hooks/useGlobalEvent';
import useResponsiveCheck from '../../hooks/useResponsiveCheck';

const CarouselModal = forwardRef(
  ({ children, visible = false, onCancel }, ref) => {
    // FIXME: better way to use `default` ref
    const carouselRef = useRefOrThis(ref);
    const isMobile = useResponsiveCheck({ max: 'md' });

    const rootElement = useMemo(() => document.getElementById('root'), []);
    const carouselLastIndex = React.Children.count(children) - 1;
    const [carouselIndex, setCarouselIndex] = useState(0);

    const onNextClick = useCallback(
      () => {
        carouselRef.current.next();
      },
      [carouselRef]
    );
    const onPreviousClick = useCallback(
      () => {
        carouselRef.current.prev();
      },
      [carouselRef]
    );
    const onCourselIndexChange = useCallback((_, newIndex) => {
      setCarouselIndex(newIndex);
    }, []);
    const onModalClose = useCallback(
      () => {
        onCancel();
        carouselRef.current.goTo(0, true);
        setCarouselIndex(0); // `beforeChange` is not triggered for `goTo`
      },
      [onCancel, carouselRef]
    );
    const onModalContentClick = useCallback(
      event => {
        // HACK: close modal on click outside of real carousel content
        const clickOutOfCarouselTrack = event.target === event.currentTarget;
        const clickInCourselTrackButOutOfCurrentSlide = event.target.classList.contains(
          'slick-track'
        );
        if (
          clickOutOfCarouselTrack ||
          clickInCourselTrackButOutOfCurrentSlide
        ) {
          onModalClose();
        }
      },
      [onModalClose]
    );
    useGlobalEvent('keydown', event => {
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
      <Modal
        appElement={rootElement}
        isOpen={visible} // TODO: animate on visibility change?
        className="__CarouselModal__ overflow-y-hidden"
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
        <Row onClick={onModalContentClick} justify="center">
          <Col
            className="max-h-90 overflow-y-scroll"
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
    );
  }
);

CarouselModal.propTypes = {
  children: PropTypes.node,
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
};

CarouselModal.displayName = 'CarouselModal';

export default CarouselModal;
