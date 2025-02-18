import * as React from 'react';
import { IconWrap } from '@progress/kendo-react-common';
export const TabStripTabTitle = props => {
  return <span className="k-icon-wrapper-host" title={props.title}>
            <IconWrap name={props.iconName} icon={props.svgIcon} />
        </span>;
};