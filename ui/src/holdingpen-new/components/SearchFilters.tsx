import React, { useState } from 'react';
import { Col, Card, Select, Row, Checkbox } from 'antd';
import { connect, RootStateOrAny } from 'react-redux';
import { Action, ActionCreator } from 'redux';
import { Map } from 'immutable';
import classNames from 'classnames';

import LoadingOrChildren from '../../common/components/LoadingOrChildren';
import UnclickableTag from '../../common/components/UnclickableTag';
import { searchQueryReset, searchQueryUpdate } from '../../actions/holdingpen';
import { COLLECTIONS, getIcon } from '../utils/utils';
import LinkLikeButton from '../../common/components/LinkLikeButton/LinkLikeButton';

interface SearchFiltersProps {
  dispatch: ActionCreator<Action>;
  loading: boolean;
  query: Map<string, any>;
  facets: any;
  count: any;
}

const FilterOption: React.FC<{
  label: string;
  options: Map<string, any>;
  selectedKey: string | null;
  onSelect: (key: string | null) => void;
  renderLabel: (key: string) => React.ReactNode;
}> = ({ label, options, selectedKey, onSelect, renderLabel }) => {
  if (!options?.size) return null;

  return (
    <>
      <Row>
        <p className="facet-category mt3">{label}</p>
      </Row>
      {options.map((option: Map<string, any>) => {
        const key = option.get('key');
        const isChecked = selectedKey === key;
        return (
          <Row className="mb2" justify="space-between" key={key}>
            <Col>
              <Checkbox
                checked={isChecked}
                onChange={() => onSelect(isChecked ? null : key)}
              >
                {renderLabel(key)}
              </Checkbox>
            </Col>
            <Col>
              <UnclickableTag>{option.get('doc_count')}</UnclickableTag>
            </Col>
          </Row>
        );
      })}
    </>
  );
};

const SearchFilters: React.FC<SearchFiltersProps> = ({
  dispatch,
  loading,
  query,
  facets,
  count,
}) => {
  const [selectedFilters, setSelectedFilters] = useState({
    status: query?.get('status'),
    workflow_type: query?.get('workflow_type'),
  });

  const updateFilters = (key: string, value: string | null) => {
    setSelectedFilters((prevFilters) => ({ ...prevFilters, [key]: value }));
    dispatch(
      searchQueryUpdate({
        ...query.toJS(),
        page: 1,
        [key]: value,
      })
    );
  };

  return (
    <Col xs={0} lg={5}>
      <LoadingOrChildren loading={loading}>
        <Card>
          <p className="facet-category">Results per page</p>
          <Select
            defaultValue="10"
            value={query.get('size')}
            style={{ width: '100%', marginBottom: '1rem' }}
            data-testid="select-results-per-page"
            options={[
              { value: 10, label: '10' },
              { value: 25, label: '25' },
              { value: 50, label: '50' },
              { value: 100, label: '100' },
            ]}
            onChange={(value: number) =>
              dispatch(
                searchQueryUpdate({
                  page: 1,
                  size: value,
                  ordering: query.get('ordering'),
                })
              )
            }
          />

          <p className="facet-category mt3">Sort by</p>
          <Select
            defaultValue="-_updated_at"
            value={query.get('ordering')}
            style={{ width: '100%', marginBottom: '1rem' }}
            data-testid="select-sort-by"
            options={[
              { value: '-_updated_at', label: 'Most recent' },
              { value: '_updated_at', label: 'Least recent' },
            ]}
            onChange={(value: string) =>
              dispatch(
                searchQueryUpdate({
                  page: 1,
                  size: query.get('size'),
                  ordering: value,
                })
              )
            }
          />

          {count > 0 && (
            <>
              <FilterOption
                label="Filter by collection"
                options={facets
                  ?.getIn(['_filter_workflow_type', 'workflow_type'])
                  ?.get('buckets')}
                selectedKey={selectedFilters.workflow_type}
                onSelect={(key) => updateFilters('workflow_type', key)}
                renderLabel={(key) => (
                  <span className="ttc">
                    {
                      COLLECTIONS.find((collection) => collection.value === key)
                        ?.key
                    }
                  </span>
                )}
              />

              <FilterOption
                label="Filter by status"
                options={facets
                  ?.getIn(['_filter_status', 'status'])
                  ?.get('buckets')}
                selectedKey={selectedFilters.status}
                onSelect={(key) => updateFilters('status', key)}
                renderLabel={(key) => (
                  <span className={classNames(key?.toLowerCase(), 'ttc')}>
                    {getIcon(key)}
                    {key}
                  </span>
                )}
              />
            </>
          )}

          <Row justify="center" className="mt4">
            <LinkLikeButton
              onClick={() => {
                setSelectedFilters({ status: null, workflow_type: null });
                dispatch(searchQueryReset());
              }}
            >
              Reset filters
            </LinkLikeButton>
          </Row>
        </Card>
      </LoadingOrChildren>
    </Col>
  );
};

const mapStateToProps = (state: RootStateOrAny) => ({
  loading: state.holdingpen.get('loading'),
  query: state.holdingpen.get('query'),
  facets: state.holdingpen.get('facets'),
  count: state.holdingpen.get('totalResults'),
});

export default connect(mapStateToProps)(SearchFilters);
