import * as React from 'react';
import { Badge, BadgeContainer } from '@progress/kendo-react-indicators';
import { GridColumnMenuSort, GridColumnMenuFilter, GridColumnMenuGroup } from '@progress/kendo-react-grid';
import { ProgressBar } from '@progress/kendo-react-progressbars';
import { Rating } from '@progress/kendo-react-inputs';
export const BadgeCell = props => {
  const {
    dataItem
  } = props;
  const isOnline = dataItem.is_online;
  return <td {...props.tdProps}>
      <BadgeContainer>
        {isOnline ? <Badge size="small" themeColor="success" cutoutBorder={true}>
            <span>Online</span>
          </Badge> : <Badge size="small" align={{
        vertical: 'bottom',
        horizontal: 'end'
      }} themeColor="error" cutoutBorder={true}>
            <span>Offline</span>
          </Badge>}
      </BadgeContainer>
    </td>;
};
export const BudgetCell = props => {
  const {
    dataItem
  } = props;
  if (dataItem && dataItem.target !== undefined) {
    const budget = dataItem.target;
    const formattedBudget = `$${budget.toFixed(3)}`;
    return <td {...props.tdProps}>{formattedBudget}</td>;
  }
};
export const ColumnMenu = props => {
  return <div>
      <GridColumnMenuSort {...props} />
      <GridColumnMenuFilter {...props} />
      <GridColumnMenuGroup {...props} />
    </div>;
};
export const PersonCell = props => {
  const {
    dataItem
  } = props;
  if (!dataItem || !dataItem.image) {
    return dataItem.full_name;
  }
  const imageDataUrl = dataItem.image.replace(/url\('(.*)'\)/, '$1');
  return <td {...props.tdProps}>
      <img src={imageDataUrl} width="34" height="34" className="contact-img" />
      <span style={{
      display: 'inlineBlock',
      paddingLeft: '10px',
      verticalAlign: 'middle',
      lineHeight: '32px'
    }} className="person-name">
        {dataItem.full_name}
      </span>
    </td>;
};
export const ProgressCell = props => {
  const progress = props.dataItem.target;
  if (props.rowType === 'groupHeader') {
    return;
  }
  return <td {...props.tdProps}>
      <ProgressBar style={{
      width: '150px',
      height: '10px',
      marginRight: '20px'
    }} value={progress} labelVisible={false} />
      {progress} %<span> </span>
    </td>;
};
export const RatingCell = props => {
  const field = props.field || '';
  const value = props.dataItem[field];
  if (props.rowType === 'groupHeader') {
    return null;
  }
  return <td {...props.tdProps}>
      <Rating value={value === null ? '' : props.dataItem[field]} readonly={true} />{' '}
    </td>;
};
export const CountryCell = props => {
  const {
    dataItem
  } = props;
  if (!dataItem || !dataItem.flag) {
    return null;
  }
  return <td {...props.tdProps}>
      <img src={dataItem.flag} width="30" height="16" alt="Flag" style={{
      marginLeft: '12px'
    }} />
    </td>;
};