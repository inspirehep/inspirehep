import React from 'react';

const LiteratureResultItem = ({ item }: { item: any }) => {
  const data = item?.get('data');
  const title = data?.getIn(['titles', 0, 'title']);

  return (
    <div className="flex">
      <span className="dib ml2">{title}</span>
    </div>
  );
};

export default LiteratureResultItem;
