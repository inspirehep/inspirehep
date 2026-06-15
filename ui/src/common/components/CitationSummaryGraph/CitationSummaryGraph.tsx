import React, { useState, useMemo, useCallback } from 'react';
import {
  XAxis,
  YAxis,
  Bar,
  LabelList,
  ComposedChart,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Row, Col, Tooltip } from 'antd';
import { Map as ImmutableMap } from 'immutable';

import './CitationSummaryGraph.less';
import LoadingOrChildren from '../LoadingOrChildren';
import ErrorAlertOrChildren from '../ErrorAlertOrChildren';
import { CITEABLE_BAR_TYPE, PUBLISHED_BAR_TYPE } from '../../constants';
import styleVariables from '../../../styleVariables';
import { shallowEqual, abbreviateNumber } from '../../utils';

const GRAPH_MARGIN = { left: 0, right: 30, top: 40, bottom: 40 };
const GRAPH_HEIGHT = 300;

export const ORANGE = styleVariables['@orange-6'];
export const HOVERED_ORANGE = styleVariables['@orange-7'];
export const BLUE = styleVariables['@primary-color'];
export const HOVERED_BLUE = styleVariables['@blue-7'];
export const GRAY = styleVariables['@gray-6'];

const getCountLabel = (docCount: number) => {
  if (docCount === 0) return null;
  if (docCount < 10000) return docCount.toString();
  return abbreviateNumber(docCount).toString();
};

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

export interface BarType {
  xValue: string | number;
  type: 'citeable' | 'published';
}

interface BucketData {
  key: string;
  doc_count: number;
}

interface MergedBarData {
  x: string;
  citeableY: number;
  publishedY: number;
}

interface BarShapeProps {
  x: number;
  y: number;
  width: number;
  height: number;
  payload?: MergedBarData;
}

interface BarEventData {
  payload?: MergedBarData;
}

interface CitationSummaryGraphProps {
  citeableData: BucketData[];
  publishedData: BucketData[];
  loading: boolean;
  error: ImmutableMap<string, string> | undefined;
  selectedBar: BarType;
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
  const [hoveredBar, setHoveredBar] = useState<BarType | null>(null);

  const getBarColor = useCallback(
    (bar: BarType) => {
      if (shallowEqual(bar, hoveredBar as BarType)) {
        return typeToColors[bar.type].hoveredColor;
      }
      if (!selectedBar || shallowEqual(bar, selectedBar)) {
        return typeToColors[bar.type].color;
      }
      return GRAY;
    },
    [hoveredBar, selectedBar]
  );

  const citeableBarShape = useCallback(
    (props: BarShapeProps) => (
      <rect
        x={props.x}
        y={props.y}
        width={props.width}
        height={props.height}
        fill={
          props.payload !== undefined
            ? getBarColor({ xValue: props.payload.x, type: CITEABLE_BAR_TYPE })
            : undefined
        }
      />
    ),
    [getBarColor]
  );

  const publishedBarShape = useCallback(
    (props: BarShapeProps) => (
      <rect
        x={props.x}
        y={props.y}
        width={props.width}
        height={props.height}
        fill={
          props.payload !== undefined
            ? getBarColor({ xValue: props.payload.x, type: PUBLISHED_BAR_TYPE })
            : undefined
        }
      />
    ),
    [getBarColor]
  );

  const isSelectedBar = (bar: BarType) => shallowEqual(bar, selectedBar);

  const onBarMouseOut = () => {
    setHoveredBar(null);
  };

  const onBarClick = (clickedBar: BarType) => {
    if (isSelectedBar(clickedBar)) {
      onSelectBarChange(null);
    } else {
      onSelectBarChange(clickedBar, excludeSelfCitations);
    }
  };

  const onCiteableBarClick = (datapoint: BarEventData) => {
    if (datapoint.payload === undefined) return;
    onBarClick({ xValue: datapoint.payload.x, type: CITEABLE_BAR_TYPE });
  };

  const onPublishedBarClick = (datapoint: BarEventData) => {
    if (datapoint.payload === undefined) return;
    onBarClick({ xValue: datapoint.payload.x, type: PUBLISHED_BAR_TYPE });
  };

  const onCiteableBarHover = (datapoint: BarEventData) => {
    if (datapoint.payload === undefined) return;
    setHoveredBar({ xValue: datapoint.payload.x, type: CITEABLE_BAR_TYPE });
  };

  const onPublishedBarHover = (datapoint: BarEventData) => {
    if (datapoint.payload === undefined) return;
    setHoveredBar({ xValue: datapoint.payload.x, type: PUBLISHED_BAR_TYPE });
  };

  const mergedData = useMemo<MergedBarData[]>(() => {
    const citeableMap = new Map(
      citeableData.map((b) => [b.key, b.doc_count as number])
    );
    const publishedMap = new Map(
      publishedData.map((b) => [b.key, b.doc_count as number])
    );
    const allKeys = [
      ...new Set([
        ...citeableData.map((b) => b.key),
        ...publishedData.map((b) => b.key),
      ]),
    ];

    return allKeys.map((x) => ({
      x,
      citeableY: citeableMap.get(x) ?? 0,
      publishedY: publishedMap.get(x) ?? 0,
    }));
  }, [citeableData, publishedData]);

  return (
    <div className="__CitationSummaryGraph__">
      <LoadingOrChildren loading={loading}>
        <ErrorAlertOrChildren error={error}>
          <Row align="middle">
            <Col span={24}>
              <Tooltip
                title="Click a bar to select papers. Click the bar again to reset your selection."
                placement="bottom"
              >
                <div>
                  <ResponsiveContainer height={GRAPH_HEIGHT} width="100%">
                    <ComposedChart data={mergedData} margin={GRAPH_MARGIN}>
                      <Legend />
                      <XAxis
                        dataKey="x"
                        className="x-axis"
                        tickFormatter={(v) =>
                          xValueToLabel[v as keyof typeof xValueToLabel]
                        }
                        label={{
                          value: 'Citations',
                          position: 'insideBottomRight',
                          offset: -15,
                        }}
                      />
                      <YAxis
                        className="y-axis"
                        tickFormatter={abbreviateNumber}
                        label={{
                          value: 'Papers',
                          angle: 0,
                          position: 'top',
                          offset: 20,
                        }}
                      />
                      <Bar
                        shape={citeableBarShape}
                        dataKey="citeableY"
                        name="Citeable"
                        fill={BLUE}
                        isAnimationActive={false}
                        onMouseEnter={onCiteableBarHover}
                        onClick={onCiteableBarClick}
                        onMouseLeave={onBarMouseOut}
                        className="pointer"
                      >
                        <LabelList
                          dataKey="citeableY"
                          position="top"
                          formatter={(v) => getCountLabel(v as number)}
                        />
                      </Bar>
                      <Bar
                        shape={publishedBarShape}
                        dataKey="publishedY"
                        name="Published"
                        fill={ORANGE}
                        isAnimationActive={false}
                        onMouseEnter={onPublishedBarHover}
                        onClick={onPublishedBarClick}
                        onMouseLeave={onBarMouseOut}
                        className="pointer"
                      >
                        <LabelList
                          dataKey="publishedY"
                          position="top"
                          formatter={(v) => getCountLabel(v as number)}
                        />
                      </Bar>
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
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
