// App.jsx
// ---------------------------------------------------------------------------
// Main React component using KendoReact Grid with simulated server-side logic.


import React, { useState, useMemo } from "react";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import { sampleData, applyFilter, applySort } from "./dataService";
import TabbedGrid from './tabbed/tabbedGridServer';


const App = () => {
    const [page, setPage] = useState({ skip: 0, take: 10 });
    const [sort, setSort] = useState([]);
    const [filter, setFilter] = useState(null);


// Filtering
    const filteredData = useMemo(() => applyFilter(sampleData, filter), [filter]);


// Sorting
    const sortedData = useMemo(() => applySort(filteredData, sort), [filteredData, sort]);


// Paging
    const pagedData = useMemo(() => {
        return sortedData.slice(page.skip, page.skip + page.take);
    }, [sortedData, page]);


    const pageChange = (e) => {
        setPage({ skip: e.page.skip, take: e.page.take });
    };


    const sortChange = (e) => {
        setSort(e.sort);
    };


    const filterChange = (e) => {
        setFilter(e.filter);
    };


    return (
        <div style={{ padding: 20 }}>
            <h2>KendoReact Grid — Local Data Simulation (Paging, Sorting, Filtering)</h2>


            <Grid
                style={{ height: "500px" }}
                data={pagedData}
                skip={page.skip}
                take={page.take}
                total={sortedData.length}
                pageable={{ pageSizes: [5, 10, 20] }}
                sortable
                filterable
                onPageChange={pageChange}
                onSortChange={sortChange}
                onFilterChange={filterChange}
                sort={sort}
                filter={filter}
            >
                <GridColumn field="name" title="Name" />
                <GridColumn field="description" title="Description" />
            </Grid>

            <br/>
            <p>Tabbed Grid</p>
            <br/>

            <TabbedGrid/>
        </div>
    );
}

export default App;