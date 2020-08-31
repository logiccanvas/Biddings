export interface IApiQuery {
    filter?: any;
    offset?: any;
    limit: number;
    search?: string | null;
    q?: string | null;
    order_by?: string;
    order_direction?: any;
}

export interface FilterSortSimpleTableProps {
    data: any;
    columns: any[];
    title?: string;
    allowHoverRows?: boolean;
    hover?: boolean;
    pagination?: any;
    tableHeight?: any;
    loading?: boolean;
    checkable?: boolean;
    bulkCheck?: boolean;
    tableWrapperClass?: string;
    onPagination?: ( pagination ) => void;
    onRowClick?: ( row: any, event: any ) => any;
    onRowCheck?: ( row ) => void;
    onBulkCheck?: ( checked: boolean ) => void;
}
