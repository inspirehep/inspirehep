import classnames from 'classnames';
import { List } from 'immutable';

import './InlineList.less';
import { getSizeOfArrayOrImmutableList } from '../../utils';
import { DEFAULT_SEPARATOR_TYPE } from './constants';

const InlineDataList = ({
  items = null,
  renderItem = (item: any) => item,
  label,
  suffix = null,
  extractKey = (item: any) => item,
  separateItems = true,
  separator = DEFAULT_SEPARATOR_TYPE,
  wrapperClassName = '',
  labelClassName,
}: {
  items?: List<any> | null;
  renderItem?: Function;
  label?: string;
  suffix?: any;
  extractKey?: Function;
  separateItems?: boolean;
  separator?: string;
  wrapperClassName?: string;
  labelClassName?: string;
}) =>
  items && getSizeOfArrayOrImmutableList(items) > 0 ? (
    <div
      className={classnames('__InlineList__', wrapperClassName)}
      data-testid="inline-data-list"
    >
      {label && <span className={classnames(labelClassName)}>{label}: </span>}
      <ul>
        {items.map((item, index) => (
          <li key={`${extractKey(item)}-${index * 2}`}>
            {renderItem(item, index)}
            {separateItems && index < items.size - 1 && separator}
          </li>
        ))}
      </ul>
      {suffix}
    </div>
  ) : (
    <></>
  );

export default InlineDataList;
