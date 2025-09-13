// ---------------------------------------------------------------------------
// dataService.js
// ---------------------------------------------------------------------------
// Contains sample data and simulated server-side logic for filtering and sorting.


export const sampleData = Array.from({ length: 27 }).map((_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
    description: `This is the description for item ${i + 1}`,
}));


export function applyFilter(data, filter) {
    if (!filter) return data;


    const evalSingle = (item, f) => {
        const value = String(item[f.field] ?? "").toLowerCase();
        const cmp = String(f.value ?? "").toLowerCase();
        switch (f.operator) {
            case "contains":
                return value.includes(cmp);
            case "startswith":
                return value.startsWith(cmp);
            case "endswith":
                return value.endsWith(cmp);
            case "eq":
                return value === cmp;
            case "neq":
                return value !== cmp;
            default:
                return true;
        }
    };


    const evaluate = (item, f) => {
        if (f.filters) {
            if (f.logic === "or") return f.filters.some((sub) => evaluate(item, sub));
            return f.filters.every((sub) => evaluate(item, sub));
        }
        return evalSingle(item, f);
    };


    return data.filter((item) => evaluate(item, filter));
}


export function applySort(data, sort) {
    if (!sort || sort.length === 0) return data;


    return [...data].sort((a, b) => {
        for (const s of sort) {
            const field = s.field;
            const dir = s.dir === "desc" ? -1 : 1;
            if (a[field] < b[field]) return -1 * dir;
            if (a[field] > b[field]) return 1 * dir;
        }
        return 0;
    });
}