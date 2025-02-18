import * as React from 'react';
export const ColumnMenuContext = React.createContext({
  onColumnsChange: _columns => {},
  onAutoSize: _columns => {},
  columns: [],
  columnsState: []
});