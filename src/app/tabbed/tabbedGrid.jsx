import * as React from 'react';
import { Grid, GridColumn as Column } from '@progress/kendo-react-grid';
import { process } from '@progress/kendo-data-query';
import { PopupPropsContext } from '@progress/kendo-react-popup';
import { classNames } from '@progress/kendo-react-common';
import { ColumnMenu } from './ColumnMenu';
import { ColumnMenuContext } from './ColumnMenuContext';
import products from './gd-products';
const createDataState = dataState => {
  return {
    result: process(products.slice(0), dataState),
    dataState: dataState
  };
};
const initialState = createDataState({
  take: 8,
  skip: 0
});
const columns = [{
  id: 'ProductID',
  field: 'ProductID',
  title: 'Product Id',
  filter: 'numeric',
  columnMenu: ColumnMenu
}, {
  id: 'ProductName',
  field: 'ProductName',
  columnMenu: ColumnMenu
}, {
  id: 'UnitPrice',
  field: 'UnitPrice',
  filter: 'numeric',
  columnMenu: ColumnMenu
}, {
  id: 'Discontinued',
  field: 'Discontinued',
  filter: 'boolean',
  columnMenu: ColumnMenu
}];
const TabbedGrid = () => {
  const gridRef = React.useRef(null);
  const [result, setResult] = React.useState(initialState.result);
  const [dataState, setDataState] = React.useState(initialState.dataState);
  const [columnsState, setColumnsState] = React.useState(columns);
  const dataStateChange = event => {
    const updatedState = createDataState(event.dataState);
    setResult(updatedState.result);
    setDataState(updatedState.dataState);
  };
  const onColumnsChange = React.useCallback(cols => {
    setColumnsState(cols);
  }, []);
  const onAutoSize = React.useCallback(cols => {
    const ids = cols.map(c => c.id);
    gridRef.current?.fitColumns(ids);
  }, []);
  return <ColumnMenuContext.Provider value={{
    onColumnsChange,
    onAutoSize,
    columnsState,
    columns
  }}>
            <PopupPropsContext.Provider value={({
      popupClass,
      ...props
    }) => {
      const newPopupClass = classNames(popupClass, {
        'k-column-menu-tabbed': popupClass && popupClass?.toString().includes('k-column-menu')
      });
      return {
        ...props,
        popupClass: newPopupClass
      };
    }}>
                <Grid data={result} {...dataState} onDataStateChange={dataStateChange} sortable={true} pageable={true} pageSize={8} ref={gridRef}>
                    {columnsState.map(c => <Column key={c.id} {...c} />)}
                </Grid>
            </PopupPropsContext.Provider>
        </ColumnMenuContext.Provider>;
};
export default TabbedGrid;