import * as React from 'react';
import { getter } from '@progress/kendo-react-common';
import { process } from '@progress/kendo-data-query';
import { Input } from '@progress/kendo-react-inputs';
import { GridPDFExport } from '@progress/kendo-react-pdf';
import { ExcelExport } from '@progress/kendo-react-excel-export';
import { Button } from '@progress/kendo-react-buttons';
import { BadgeCell, BudgetCell, ColumnMenu, PersonCell, ProgressCell, RatingCell, CountryCell } from './custom-cells';
import { Grid, GridColumn as Column, GridToolbar } from '@progress/kendo-react-grid';
import { setGroupIds, setExpandedState } from '@progress/kendo-react-data-tools';
import { Circle as CircleGeometry } from '@progress/kendo-drawing/geometry';
import { Layout, Text } from '@progress/kendo-drawing';
import TabbedGrid from './tabbed/tabbedGrid';
import {
  Chart,
  ChartTooltip,
  ChartTitle,
  ChartLegend,
  ChartSeries,
  ChartSeriesItem,
  ChartXAxis,
  ChartXAxisItem,
  ChartYAxis,
  ChartYAxisItem,
  ChartSeriesLabels
} from '@progress/kendo-react-charts';
import bubbleData from './bubble-chart.json';
import 'hammerjs';
import { employees } from './employees';
import './style.css';
const DATA_ITEM_KEY = 'id';
const SELECTED_FIELD = 'selected';
const initialDataState = {
  take: 10,
  skip: 0,
  group: []
};
const processWithGroups = (data, dataState) => {
  const newDataState = process(data, dataState);
  setGroupIds({
    data: newDataState.data,
    group: dataState.group
  });
  return newDataState;
};
const [firstSeries, secondSeries, thirdSeries] = [[1, 2, 3], [1, -1, 1], [1, -1, 1]];

const donutData = [{
  kind: 'Hydroelectric',
  share: 0.175
}, {
  kind: 'Nuclear',
  share: 0.238
}, {
  kind: 'Coal',
  share: 0.118
}, {
  kind: 'Solar',
  share: 0.052
}, {
  kind: 'Wind',
  share: 0.225
}, {
  kind: 'Other',
  share: 0.192
}];

let center;
let radius;
const labelContent = e => e.category;
const visualHandler = e => {
  // Obtain parameters for the segments
  center = e.center;
  radius = e.innerRadius;

  // Create default visual
  return e.createVisual();
};
const onRender = e => {
  // The center and radius are populated by now.
  // We can ask a circle geometry to calculate the bounding rectangle for us.
  //
  // http://www.telerik.com/kendo-react-ui/components/drawing/api/geometry/Circle/
  const circleGeometry = new CircleGeometry([center.x, center.y], radius);
  const bbox = circleGeometry.bbox();

  // Render the text
  //
  // http://www.telerik.com/kendo-react-ui/components/drawing/api/Text/
  const heading = new Text('22.5%', [0, 0], {
    font: '28px Verdana,Arial,sans-serif'
  });
  const line1 = new Text('of which', [0, 0], {
    font: '16px Verdana,Arial,sans-serif'
  });
  const line2 = new Text('renewables', [0, 0], {
    font: '16px Verdana,Arial,sans-serif'
  });

  // Reflow the text in the bounding box
  //
  // http://www.telerik.com/kendo-react-ui/components/drawing/api/Layout
  // http://www.telerik.com/kendo-react-ui/components/drawing/api/LayoutOptions
  const layout = new Layout(bbox, {
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    spacing: 5
  });
  layout.append(heading, line1, line2);
  layout.reflow();

  // Draw it on the Chart drawing surface
  //
  // http://www.telerik.com/kendo-react-ui/components/charts/api/Chart/#toc-surface
  if (e.target.surface) {
    e.target.surface.draw(layout);
  }
};

const AppOrg = () => {
  const idGetter = getter('id');
  const [filterValue, setFilterValue] = React.useState();
  const [filteredData, setFilteredData] = React.useState(employees);
  const [currentSelectedState, setCurrentSelectedState] = React.useState({});
  const [dataState, setDataState] = React.useState(initialDataState);
  const [dataResult, setDataResult] = React.useState(process(filteredData, dataState));
  const [data, setData] = React.useState(filteredData);
  const onFilterChange = ev => {
    let value = ev.value;
    setFilterValue(ev.value);
    let newData = employees.filter(item => {
      let match = false;
      for (const property in item) {
        if (item[property].toString().toLocaleLowerCase().indexOf(value.toLocaleLowerCase()) >= 0) {
          match = true;
        }
        if (item[property].toLocaleDateString && item[property].toLocaleDateString().indexOf(value) >= 0) {
          match = true;
        }
      }
      return match;
    });
    setFilteredData(newData);
    let clearedPagerDataState = {
      ...dataState,
      take: 8,
      skip: 0
    };
    let processedData = process(newData, clearedPagerDataState);
    processedData.data = processedData.data.map(item => ({
      ...item,
      selected: currentSelectedState[item[DATA_ITEM_KEY]]
    }));
    setDataResult(processedData);
    setDataState(clearedPagerDataState);
    setData(newData);
  };
  const [resultState, setResultState] = React.useState(processWithGroups(employees.map(item => ({
    ...item,
    ['selected']: currentSelectedState[idGetter(item)]
  })), initialDataState));
  const dataStateChange = event => {
    let processedData = process(filteredData, event.dataState);
    processedData.data = processedData.data.map(item => ({
      ...item,
      selected: currentSelectedState[item[DATA_ITEM_KEY]]
    }));
    setDataResult(processedData);
    setDataState(event.dataState);
  };
  const onExpandChange = React.useCallback(event => {
    const newData = [...dataResult.data];
    const item = event.dataItem;
    if (item.groupId) {
      const targetGroup = newData.find(d => d.groupId === item.groupId);
      if (targetGroup) {
        targetGroup.expanded = event.value;
        setDataResult({
          ...dataResult,
          data: newData
        });
      }
    } else {
      item.expanded = event.value;
      setDataResult({
        ...dataResult,
        data: newData
      });
    }
  }, [dataResult]);
  const setSelectedValue = data => {
    let newData = data.map(item => {
      if (item.items) {
        return {
          ...item,
          items: setSelectedValue(item.items)
        };
      } else {
        return {
          ...item,
          ['selected']: currentSelectedState[idGetter(item)]
        };
      }
    });
    return newData;
  };
  const newData = setExpandedState({
    data: setSelectedValue(resultState.data),
    collapsedIds: []
  });
  const onHeaderSelectionChange = React.useCallback(event => {
    const checkboxElement = event.syntheticEvent.target;
    const checked = checkboxElement.checked;
    const newSelectedState = {};
    data.forEach(item => {
      newSelectedState[idGetter(item)] = checked;
    });
    setCurrentSelectedState(newSelectedState);
    const newData = data.map(item => ({
      ...item,
      [SELECTED_FIELD]: checked
    }));
    const newDataResult = processWithGroups(newData, dataState);
    setDataResult(newDataResult);
  }, [data, dataState]);
  const onSelectionChange = event => {
    const selectedProductId = event.dataItem.id;
    const newSelectedState = {
      ...currentSelectedState,
      [selectedProductId]: !currentSelectedState[selectedProductId]
    };
    setCurrentSelectedState(newSelectedState);
    const newData = data.map(item => {
      return {
        ...item,
        selected: newSelectedState[idGetter(item)]
      };
    });
    const newDataResult = processWithGroups(newData, dataState);
    setDataResult(newDataResult);
  };
  const getNumberOfItems = data => {
    let count = 0;
    data.forEach(item => {
      if (item.items) {
        count = count + getNumberOfItems(item.items);
      } else {
        count++;
      }
    });
    return count;
  };
  const getNumberOfSelectedItems = data => {
    let count = 0;
    data.forEach(item => {
      if (item.items) {
        count = count + getNumberOfSelectedItems(item.items);
      } else {
        count = count + (item.selected == true ? 1 : 0);
      }
    });
    return count;
  };
  const checkHeaderSelectionValue = () => {
    let selectedItems = getNumberOfSelectedItems(newData);
    return newData.length > 0 && selectedItems == getNumberOfItems(newData);
  };
  let _pdfExport;
  const exportExcel = () => {
    _export.save();
  };
  let _export;
  const exportPDF = () => {
    _pdfExport.save();
  };
  return 
  
  
  <div>
      <br/>
        <p>Tabbed Grid</p>
      <br/>

      <TabbedGrid/>


      <br/>
        <p>Another Grid</p>
      <br/>



      <ExcelExport data={employees} ref={exporter => {
      _export = exporter;
    }}>
        <Grid style={{
        height: '500px'
      }} pageable={{
        pageSizes: true
      }} data={dataResult} sortable={true} total={resultState.total} onDataStateChange={dataStateChange} {...dataState} onExpandChange={onExpandChange} expandField="expanded" dataItemKey={DATA_ITEM_KEY} selectedField={SELECTED_FIELD} onHeaderSelectionChange={onHeaderSelectionChange} onSelectionChange={onSelectionChange} groupable={true} size={'small'}>
          <GridToolbar>
            <Input value={filterValue} onChange={onFilterChange} style={{
            border: '2px solid #ccc',
            boxShadow: 'inset 0px 0px 0.5px 0px rgba(0,0,0,0.0.1)',
            width: '210px',
            height: '30px',
            marginRight: '10px'
          }} placeholder="Search in all columns..." />
            <div className="export-btns-container">
              <Button onClick={exportExcel} style={{
              marginRight: 20
            }}>Export to Excel</Button>
              <Button onClick={exportPDF}>Export to PDF</Button>
            </div>
          </GridToolbar>
          <Column filterable={false} field={SELECTED_FIELD} width={50} headerSelectionValue={checkHeaderSelectionValue()} />

          <Column title="Employee">
            <Column field="full_name" title="Contact Name" columnMenu={ColumnMenu} cells={{
            data: PersonCell
          }} width="250px" />
            <Column field="job_title" title="Job Title" columnMenu={ColumnMenu} width="220px" />
            <Column field="country" title="Country" cells={{
            data: CountryCell
          }} columnMenu={ColumnMenu} width="100px" />
            <Column field="is_online" title="Status" filter="text" cells={{
            data: BudgetCell
          }} columnMenu={ColumnMenu} width="100px" />
          </Column>
          <Column title="Performance">
            <Column field="rating" title="Rating" cells={{
            data: RatingCell
          }} columnMenu={ColumnMenu} width="230px" />
            <Column field="target" title="Engagement" cells={{
            data: ProgressCell
          }} columnMenu={ColumnMenu} width="250px" />
            <Column field="budget" title="Budget" columnMenu={ColumnMenu} cells={{
            data: BudgetCell
          }} width="230px" />
          </Column>
          <Column title="Contacts">
            <Column field="phone" title="Phone" columnMenu={ColumnMenu} width="230px" />
            <Column field="address" title="Address" columnMenu={ColumnMenu} width="230px" />
          </Column>
        </Grid>
      </ExcelExport>
      <GridPDFExport ref={element => {
      _pdfExport = element;
    }} margin="1cm">
        <Grid style={{
        height: '500px'
      }} pageable={{
        pageSizes: true
      }} data={dataResult} sortable={true} total={resultState.total} onDataStateChange={dataStateChange} {...dataState} onExpandChange={onExpandChange} expandField="expanded" dataItemKey={DATA_ITEM_KEY} selectedField={SELECTED_FIELD} onHeaderSelectionChange={onHeaderSelectionChange} onSelectionChange={onSelectionChange} groupable={true} size={'small'}>
          <GridToolbar>
            <Input value={filterValue} onChange={onFilterChange} style={{
            border: '2px solid #ccc',
            boxShadow: 'inset 0px 0px 0.5px 0px rgba(0,0,0,0.0.1)',
            width: '170px',
            height: '30px',
            marginRight: '10px'
          }} placeholder="Search in all columns..." />
            <div className="export-btns-container">
              <Button onClick={exportExcel}>Export to Excel</Button>
              <Button>Export to PDF</Button>
            </div>
          </GridToolbar>
          <Column filterable={false} field={SELECTED_FIELD} width={50} headerSelectionValue={checkHeaderSelectionValue()} />
          <Column title="Employee">
            <Column field="full_name" title="Contact Name" columnMenu={ColumnMenu} cells={{
            data: CountryCell
          }} width="250px" />
            <Column field="job_title" title="Job Title" filter="numeric" columnMenu={ColumnMenu} width="220px" />
            <Column field="flag" title="Country" filter="numeric" cells={{
            data: CountryCell
          }} columnMenu={ColumnMenu} width="100px" />
            <Column field="is_online" title="Status" filter="text" cells={{
            data: BadgeCell
          }} columnMenu={ColumnMenu} width="100px" />
          </Column>
          <Column title="Performance">
            <Column field="rating" title="Rating" cells={{
            data: RatingCell
          }} columnMenu={ColumnMenu} width="230px" />
            <Column field="target" title="Engagement" cells={{
            data: ProgressCell
          }} columnMenu={ColumnMenu} width="250px" />
            <Column field="budget" title="Budget" columnMenu={ColumnMenu} cells={{
            data: BudgetCell
          }} width="230px" />
          </Column>
          <Column title="Contacts">
            <Column field="phone" title="Phone" columnMenu={ColumnMenu} width="230px" />
            <Column field="address" title="Address" columnMenu={ColumnMenu} width="230px" />
          </Column>
        </Grid>
      </GridPDFExport>

        <br/>
        <p>Stacked Bar Chart</p>
        <br/>
      <Chart>
          <ChartSeries>
              <ChartSeriesItem type="bar" stack={true} data={firstSeries}  type="column" />
              <ChartSeriesItem type="bar" data={secondSeries}   type="column"/>
              <ChartSeriesItem type="bar" data={thirdSeries}  type="column" />
          </ChartSeries>
      </Chart>

       <br/>
              <p>Bubble Chart</p>
              <br/>

      <Chart>
          <ChartTitle text="Reveenue per Product Type" align="left"/>
          <ChartSeries>
            <ChartSeriesItem
              type="bubble"
              xField="x"
              yField="y"
              sizeField="size"
              categoryField="category"
              data={bubbleData}
            />
          </ChartSeries>
          <ChartXAxis>
            <ChartXAxisItem
              axisCrossingValue={-5000}
              majorUnit={2000}
              labels={{
                format: '{0:N0}',
                skip: 1,
                rotation: 'auto',
              }}
            />
          </ChartXAxis>
          <ChartYAxis>
            <ChartYAxisItem
              labels={{
                format: '{0:N0}',
              }}
            />
          </ChartYAxis>
          <ChartLegend visible={true} />
          <ChartTooltip format="{3}: {2:N0} revenue" opacity={1} />
        </Chart>

         <br/>
                      <p>Donut Chart</p>
                      <br/>

        <Chart onRender={onRender}>
                <ChartSeries>
                    <ChartSeriesItem type="donut" data={donutData} categoryField="kind" field="share" visual={visualHandler}>
                        <ChartSeriesLabels color="#fff" background="none" content={labelContent} />
                    </ChartSeriesItem>
                </ChartSeries>
                <ChartLegend position="left" visible={true} />
            </Chart>
    </div>;
};
export default AppOrg;