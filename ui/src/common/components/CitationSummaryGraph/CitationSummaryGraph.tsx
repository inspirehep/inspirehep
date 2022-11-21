import React, { useState, useEffect, useRef } from 'react';
import {
  XAxis,
  YAxis,
  VerticalBarSeries,
  LabelSeries,
  FlexibleWidthXYPlot,
  DiscreteColorLegend,
  ChartLabel,
  RVValueEventHandler,
  VerticalBarSeriesPoint,
} from 'react-vis';
import { Row, Col, Tooltip } from 'antd';
import { Map } from 'immutable';

import './CitationSummaryGraph.less';
import 'react-vis/dist/style.css';
import maxBy from 'lodash.maxby';
import LoadingOrChildren from '../LoadingOrChildren';
import ErrorAlertOrChildren from '../ErrorAlertOrChildren';
import { CITEABLE_BAR_TYPE, PUBLISHED_BAR_TYPE } from '../../constants';
import styleVariables from '../../../styleVariables';
import { shallowEqual, abbreviateNumber } from '../../utils';
import { browser } from '../../browser';

const BAR_WIDTH = 0.75;
const GRAPH_MARGIN = { left: 42, right: 10, top: 30, bottom: 40 };
const GRAPH_HEIGHT = 250;
const LABEL_ANCHOR_AT_Y = browser.isSafari() ? 'text-top' : 'text-after-edge';

export const ORANGE = styleVariables['@orange-6'];
export const HOVERED_ORANGE = styleVariables['@orange-7'];
export const BLUE = styleVariables['@primary-color'];
export const HOVERED_BLUE = styleVariables['@blue-7'];
export const GRAY = styleVariables['@gray-6'];

const LEGENDS = [
  { title: 'Citeable', color: BLUE },
  { title: 'Published', color: ORANGE },
];

const xValueToLabel = {
  '0--0': '0',
  '1--9': '1-9',
  '10--49': '10-49',
  '50--99': '50-99',
  '100--249': '100-249',
  '250--499': '250-499',
  '500--': '500+',
};

const typeToColors = {
  [CITEABLE_BAR_TYPE]: { color: BLUE, hoveredColor: HOVERED_BLUE },
  [PUBLISHED_BAR_TYPE]: { color: ORANGE, hoveredColor: HOVERED_ORANGE },
};

export const LABEL_OFFSET_RATIO_TO_GRAPH_WIDTH = 0.025;

export interface Bar {
  xValue: number;
  type: 'citeable' | 'published';
}

interface CitationSummaryGraphProps {
  citeableData: any[];
  publishedData: any[];
  loading: boolean;
  error: Map<string, string> | undefined;
  selectedBar: Bar;
  onSelectBarChange: Function;
  excludeSelfCitations: boolean;
}

const CitationSummaryGraph = ({
  citeableData,
  publishedData,
  loading,
  error,
  selectedBar,
  onSelectBarChange,
  excludeSelfCitations,
}: CitationSummaryGraphProps) => {
  const [hoveredBar, setHoveredBar] = useState<Bar | null>(null);
  const [graphWidth, setGraphWidth] = useState<number>(0);

  const graphRef = useRef<HTMLDivElement>(null);

  const isHoveredBar = (bar: Bar) => shallowEqual(bar, hoveredBar as Bar);

  const isSelectedBar = (bar: Bar) => shallowEqual(bar, selectedBar);

  const onBarMouseHover = (hoveredBar: Bar) => {
    setHoveredBar(hoveredBar);
  };

  const onBarMouseOut = () => {
    setHoveredBar(null);
  };

  const onBarClick = (clickedBar: Bar) => {
    if (isSelectedBar(clickedBar)) {
      onSelectBarChange(null);
    } else {
      onSelectBarChange(clickedBar, excludeSelfCitations);
    }
  };

  const onCiteableBarClick = (datapoint: { x: number; y: number }) => {
    onBarClick({
      xValue: datapoint.x,
      type: CITEABLE_BAR_TYPE,
    });
  };

  const onPublishedBarClick = (datapoint: { x: number; y: number }) => {
    onBarClick({
      xValue: datapoint.x,
      type: PUBLISHED_BAR_TYPE,
    });
  };

  const onCiteableBarHover = (datapoint: { x: number; y: number }) => {
    const bar: Bar = {
      xValue: datapoint.x,
      type: CITEABLE_BAR_TYPE,
    };
    onBarMouseHover(bar);
  };

  const onPublishedBarHover = (datapoint: { x: number; y: number }) => {
    const bar: Bar = {
      xValue: datapoint.x,
      type: PUBLISHED_BAR_TYPE,
    };
    onBarMouseHover(bar);
  };

  const getBarColor = (bar: Bar) => {
    if (isHoveredBar(bar)) {
      return typeToColors[bar.type].hoveredColor;
    }
    if (!selectedBar || isSelectedBar(bar)) {
      return typeToColors[bar.type].color;
    }
    return GRAY;
  };

  const getCountLabel = (docCount: number) => {
    if (docCount === 0) return null;
    if (docCount < 10000) return docCount.toString();
    return abbreviateNumber(docCount).toString();
  };

  const updateGraphWidth = () => {
    const currentWidth = graphRef?.current?.getBoundingClientRect().width;
    if (currentWidth !== graphWidth) {
      setGraphWidth(currentWidth || 0);
    }
  };

  useEffect(() => {
    updateGraphWidth();
    window.addEventListener('resize', updateGraphWidth);
    return () => window.removeEventListener('resize', updateGraphWidth);
    // eslint-disable-next-line
  }, [graphWidth]);

  const toSeriesData = (
    bucket: { doc_count: number; key: number },
    type: 'published' | 'citeable'
  ) => {
    const docCount = bucket.doc_count;
    const xOffset =
      type === CITEABLE_BAR_TYPE
        ? -LABEL_OFFSET_RATIO_TO_GRAPH_WIDTH * graphWidth
        : LABEL_OFFSET_RATIO_TO_GRAPH_WIDTH * graphWidth;
    return {
      x: bucket.key,
      y: docCount,
      label: getCountLabel(docCount),
      color: getBarColor({ xValue: bucket.key, type }),
      xOffset,
    };
  };

  const publishedSeriesData = publishedData.map((b) =>
    toSeriesData(b, PUBLISHED_BAR_TYPE)
  );
  const citeableSeriesData = citeableData.map((b) =>
    toSeriesData(b, CITEABLE_BAR_TYPE)
  );

  const yDomainMax = Math.max(
    (publishedSeriesData.length !== 0 && maxBy(publishedSeriesData, 'y')?.y) || 0,
    (citeableSeriesData.length !== 0 && maxBy(citeableSeriesData, 'y')?.y) || 0
  );

  return (
    <div className="__CitationSummaryGraph__" ref={graphRef}>
      <LoadingOrChildren loading={loading}>
        <ErrorAlertOrChildren error={error}>
          <Row align="middle">
            <Col span={24}>
              <Tooltip
                title="Click a bar to select papers. Click the bar again to reset your selection."
                placement="bottom"
              >
                <FlexibleWidthXYPlot
                  height={GRAPH_HEIGHT}
                  margin={GRAPH_MARGIN}
                  xType="ordinal"
                  yDomain={[0, yDomainMax * 1.15]}
                >
                  <XAxis
                    className="x-axis"
                    tickFormat={(v) => xValueToLabel[v as keyof typeof xValueToLabel]}
                  />
                  <ChartLabel
                    text="Citations"
                    xPercent={0.91}
                    yPercent={0.82}
                  />
                  <YAxis 
                    className="y-axis"
                    tickFormat={abbreviateNumber} 
                  />
                  <ChartLabel text="Papers" yPercent={-0.08} xPercent={0} />
                  <VerticalBarSeries
                    colorType="literal"
                    data={citeableSeriesData}
                    barWidth={BAR_WIDTH}
                    onValueMouseOver={onCiteableBarHover as RVValueEventHandler<VerticalBarSeriesPoint>}
                    onValueClick={onCiteableBarClick as RVValueEventHandler<VerticalBarSeriesPoint>}
                    onValueMouseOut={onBarMouseOut}
                    data-test-id="citeable-bar-series"
                    className="pointer"
                  />
                  <LabelSeries
                    data={citeableSeriesData}
                    labelAnchorY={LABEL_ANCHOR_AT_Y}
                    labelAnchorX="middle"
                  />
                  <VerticalBarSeries
                    colorType="literal"
                    data={publishedSeriesData}
                    barWidth={BAR_WIDTH}
                    onValueMouseOver={onPublishedBarHover as RVValueEventHandler<VerticalBarSeriesPoint>}
                    onValueClick={onPublishedBarClick as RVValueEventHandler<VerticalBarSeriesPoint>}
                    onValueMouseOut={onBarMouseOut}
                    data-test-id="published-bar-series"
                    className="pointer"
                  />
                  <LabelSeries
                    data={publishedSeriesData}
                    labelAnchorY={LABEL_ANCHOR_AT_Y}
                    labelAnchorX="middle"
                  />
                  <DiscreteColorLegend
                    className="legend"
                    items={LEGENDS}
                    orientation="horizontal"
                  />
                </FlexibleWidthXYPlot>
              </Tooltip>
            </Col>
          </Row>
        </ErrorAlertOrChildren>
      </LoadingOrChildren>
    </div>
  );
};

CitationSummaryGraph.defaultProps = {
  publishedData: [],
  citeableData: [],
  loading: false,
  error: null,
  selectedBar: null,
  excludeSelfCitations: false,
};

export default CitationSummaryGraph;
