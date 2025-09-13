// TabbedGrid.jsx
import * as React from 'react';
import { Grid, GridColumn as Column } from '@progress/kendo-react-grid';
import { PopupPropsContext } from '@progress/kendo-react-popup';
import { classNames } from '@progress/kendo-react-common';
import { ColumnMenu } from './ColumnMenu';
import { ColumnMenuContext } from './ColumnMenuContext';
import products from './gd-products';

// --- simulated server-side fetch ---
const fetchProducts = async (dataState) => {
  let data = [...products];

  // Apply filtering
  if (dataState.filter && dataState.filter.filters?.length) {
    data = data.filter(item =>
        dataState.filter.filters.every(f => {
          const value = item[f.field];
          if (f.operator === 'contains') {
            return value?.toString().toLowerCase().includes(f.value.toLowerCase());
          }
          if (f.operator === 'eq') return value === f.value;
          if (f.operator === 'neq') return value !== f.value;
          if (f.operator === 'gte') return value >= f.value;
          if (f.operator === 'lte') return value <= f.value;
          return true;
        })
    );
  }

  // Apply sorting (only first sort descriptor for simplicity)
  if (dataState.sort && dataState.sort.length > 0) {
    const { field, dir } = dataState.sort[0];
    data = [...data].sort((a, b) => {
      if (a[field] < b[field]) return dir === 'asc' ? -1 : 1;
      if (a[field] > b[field]) return dir === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Total before paging
  const total = data.length;

  // Apply paging
  const { skip = 0, take = 8 } = dataState;
  data = data.slice(skip, skip + take);

  // simulate network delay
  await new Promise(r => setTimeout(r, 200));

  return { data, total };
};

// --- column definitions ---
const columns = [
  { id: 'ProductID', field: 'ProductID', title: 'Product Id', filter: 'numeric', columnMenu: ColumnMenu },
  { id: 'ProductName', field: 'ProductName', title: 'Product Name', filter: 'text', columnMenu: ColumnMenu },
  { id: 'UnitPrice', field: 'UnitPrice', title: 'Unit Price', filter: 'numeric', columnMenu: ColumnMenu },
  { id: 'Discontinued', field: 'Discontinued', title: 'Discontinued', filter: 'boolean', columnMenu: ColumnMenu }
];

const TabbedGrid = () => {
  const gridRef = React.useRef(null);

  const [result, setResult] = React.useState([]);
  const [total, setTotal] = React.useState(products.length);
  const [dataState, setDataState] = React.useState({ skip: 0, take: 8, sort: [], filter: null });
  const [columnsState, setColumnsState] = React.useState(columns);

  // load data on mount & whenever state changes
  React.useEffect(() => {
    fetchProducts(dataState).then(({ data, total }) => {
      setResult(data);
      setTotal(total);
    });
  }, [dataState]);

  const dataStateChange = (event) => {
    setDataState(event.dataState);
  };

  const onColumnsChange = React.useCallback(cols => {
    setColumnsState(cols);
  }, []);

  const onAutoSize = React.useCallback(cols => {
    const ids = cols.map(c => c.id);
    gridRef.current?.fitColumns(ids);
  }, []);

  return (
      <ColumnMenuContext.Provider value={{ onColumnsChange, onAutoSize, columnsState, columns }}>
        <PopupPropsContext.Provider
            value={({ popupClass, ...props }) => {
              const newPopupClass = classNames(popupClass, {
                'k-column-menu-tabbed': popupClass && popupClass?.toString().includes('k-column-menu')
              });
              return { ...props, popupClass: newPopupClass };
            }}
        >
          <Grid
              style={{ height: '600px' }}
              data={result}
              total={total}
              skip={dataState.skip}
              take={dataState.take}
              sortable
              filterable
              pageable={{ pageSizes: [5, 8, 20] }}
              {...dataState}
              onDataStateChange={dataStateChange}
              ref={gridRef}
          >
            {columnsState.map(c => (
                <Column key={c.id} {...c} />
            ))}
          </Grid>
        </PopupPropsContext.Provider>
      </ColumnMenuContext.Provider>
  );
};

export default TabbedGrid;
