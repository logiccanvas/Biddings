import * as React                           from 'react';
import { useState, useEffect, useCallback } from 'react';
import { createMemo }                       from '@packages/react';
import { call }                             from '@packages/functions';
import styled                               from 'styled-components';
import { classNames }                       from '@lib/utils';
import Paper                                from '@material-ui/core/Paper';
import CircularProgress                     from '@material-ui/core/CircularProgress';
import { NothingToShow }                    from '@components/NothingToShow';
import Table                                from '@material-ui/core/Table';
import TableBody                            from '@material-ui/core/TableBody';
import TableCell                            from '@material-ui/core/TableCell';
import TableContainer                       from '@material-ui/core/TableContainer';
import TableHead                            from '@material-ui/core/TableHead';
import TableRow                             from '@material-ui/core/TableRow';
import TablePagination                      from '@material-ui/core/TablePagination/TablePagination';
import { BackdropBlur }                     from '@packages/ui/elements/BackdropBlur';
import ArrowDownwardIcon                    from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon                      from '@material-ui/icons/ArrowUpward';
import Checkbox                             from '@material-ui/core/Checkbox/Checkbox';

import { Currency }                              from '@components/Currency';
import { formatDate }                            from '@lib/datetime';
import { get }                                   from 'lodash';
import { IApiQuery, FilterSortSimpleTableProps } from './Interfaces';

const DEFAULT_PAGE_SIZE = 50;
const DEFAULT_PAGE_SIZE_OPTIONS: number[] = [ 10, 15, 30, 50, 100 ];

export const FilterSortSimpleTable = createMemo<FilterSortSimpleTableProps>(( {
    data,
    title,
    columns,
    allowHoverRows,
    pagination,
    loading,
    bulkCheck,
    onPagination,
    onRowClick,
    onRowCheck,
    onBulkCheck,
    tableHeight,
    checkable,
    tableWrapperClass,
    ...restRow
} ) => {

    const [ tableData, setTableData ] = useState<any>([]);

    const [ orderBy, setOrderBy ] = useState('');
    const [ asc, setAsc ] = useState(false);
    const [ bulkList$, setBulkList ] = useState<number>(0);

    const [ apiQuery, setApiQuery ] = useState<IApiQuery>({
        filter:          pagination?.filter ?? {},
        offset:          pagination?.offset ?? 0,
        limit:           pagination?.limit ? pagination?.limit : DEFAULT_PAGE_SIZE,
        q:               pagination?.q ?? '',
        search:          pagination?.search ?? '',
        order_by:        pagination?.order_by ?? 'id',
        order_direction: pagination?.order_direction ?? 'asc'
    });

    const renderDate = ( value ) => formatDate('MMM DD, YYYY', value);
    const renderCurrency = ( value ) => <Currency>{ value }</Currency>;
    const renderNumber = ( value ): string => new Intl.NumberFormat().format(value);
    const renderDefault = ( row, column, value ) => typeof column.render === 'function' ? column.render(row) : !value && value !== 0 ? '-' : value;

    if ( allowHoverRows ) {
        restRow.hover = true;
    }

    const renderValue = ( row, column ) => {
        const value = get(row, column.field ?? '');

        switch ( column.type ) {
            case 'date':
                return renderDate(value);
            case 'currency':
                return renderCurrency(value);
            case 'number':
                return renderNumber(value);
            default:
                return renderDefault(row, column, value);
        }
    };

    const renderRowCheckbox = ( row ) => {
        return (
            <Checkbox
                checked={ row.checked ?? false }
                color={ 'primary' }
                disabled={ row.checkDisabled }
                className="table-checkbox"
                onClick={ ( event ) => handleRowCheck(event, row) }/>
        );
    };

    const renderRows = ( tableData ) => (
        tableData.map(( row, index ) => (
            <TableRow { ...restRow }
                      key={ `${ row.id }-${ index }` }
                      className={ classNames(
                          row.rowSelected,
                          row.rowActive,
                          row.redClass,
                          row.notClickable && ( 'row-not-clickable' ),
                          ( onRowClick && !row.notClickable ) && ( 'row-clickable' )
                      ) }
                      onClick={ ( event ) => handleRowClick(row, event) }>
                { renderColumn(row, index) }
            </TableRow>
        ))
    );

    const renderEmptyRow = () => {
        return (
            !loading && (
                <TableRow>
                    <TableCell
                        className={ 'empty-column' }
                        colSpan={ columns.length }>

                        <div className={ 'empty-content' }>
                            <NothingToShow
                                icon={ 'clear' }
                                title={ 'Nothing here.' }
                                text={ 'There\'s no data yet, start creating something by adding things.' }
                                maxTextWidth={ '100%' }/>
                        </div>
                    </TableCell>
                </TableRow>
            )
        );
    };

    const renderColumn = ( row, idx ) => {
        return (
            columns.map(( column ) => (
                <TableCell
                    className={ column.className }
                    key={ `${ column.title }-${ row.id }-${ column.field }-${ idx }` }>
                    { ( checkable && column.type === 'checkbox' ) ?
                        renderRowCheckbox(row) : renderValue(row, column)
                    }
                </TableCell>
            ))
        );
    };

    const sortDataBy = ( column ) => {
        if ( !column.sorting ) {
            return;
        }

        const data$ = [ ...tableData ];

        if ( orderBy === column.field ) {
            data$.reverse();
        } else {
            data$.sort(( a, b ) => ( a[ column ] > b[ column ] ) ? -1 : ( b[ column ] > a[ column ] ? 1 : 0 ));
            setOrderBy(column);
        }

        setTableData(data$);
        setAsc(!asc);
    };

    useEffect(() => {
        setTableData(data);

        const paginationData: IApiQuery = {
            filter:          pagination?.filter ?? {},
            offset:          pagination?.offset ?? 0,
            limit:           pagination?.limit ? pagination?.limit : DEFAULT_PAGE_SIZE,
            q:               pagination?.q ?? '',
            search:          pagination?.search ?? '',
            order_by:        pagination?.order_by ?? 'id',
            order_direction: pagination?.order_direction ?? 'asc'
        };

        setApiQuery(paginationData);
    }, [ tableData, data, pagination ]);

    const handleRowClick = useCallback(( row, e ) => {
        e.stopPropagation();
        call(onRowClick, row);
    }, [ onRowClick ]);

    const handlePagination = useCallback(( page ) => {
        call(onPagination, page);
    }, [ onPagination ]);

    const handleRowCheck = useCallback(( e, { id } ) => {
        e.stopPropagation();

        let checked$ = 0;

        tableData.map(( item ) => item.checked && ( ++checked$ ));

        e.target.checked ? ++checked$ : --checked$;

        setBulkList(checked$);

        call(onRowCheck, { checked: e.target.checked, id });
    }, [ onRowCheck ]);

    const handleBulkCheck = useCallback(( { target } ) => {
        const checked$ = target.checked ? 0 : tableData.length;
        setBulkList(checked$);
        call(onBulkCheck, target.checked);
    }, [ onBulkCheck ]);

    const handleChangePage = ( event: React.MouseEvent<HTMLButtonElement> | null, page: number ) => {
        const queryUpdate = { ...apiQuery, offset: page * apiQuery.limit };
        setApiQuery(queryUpdate);
        handlePagination(queryUpdate);
    };

    const handleChangeRowsPerPage = ( event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement> ) => {
        const limit = parseInt(get(event, 'target.value', DEFAULT_PAGE_SIZE), 10);
        const queryUpdate = { ...apiQuery, limit };

        setApiQuery(queryUpdate);
        handlePagination(queryUpdate);
    };

    return (
        <FilterSimpleTableWrapper
            className={ `table-wrapper ${ tableWrapperClass || '' }` }
            id={ tableHeight ? tableHeight : '100' }>

            <TableContainer component={ Paper }>

                { loading && (
                    <div className={ 'loading-block' }>
                        <CircularProgress size={ 45 } thickness={ 2 }/>
                    </div>
                ) }

                <Table className={ `filter-sort-table${ !tableData.length ? ' empty-table' : '' }` } aria-label={ title }>
                    <TableHead>
                        <TableRow>
                            { columns && ( columns.map(( column, index ) => (
                                <TableCell
                                    key={ `${ column.title }-${ column.field }-${ index }` }
                                    className={ column.className }
                                    onClick={ () => sortDataBy(column) }>

                                    { ( checkable && column.type === 'checkbox' ) ? (
                                        <Checkbox
                                            indeterminate={ tableData && bulkList$ > 0 && bulkList$ < tableData.length }
                                            checked={ bulkCheck ?? false }
                                            color={ 'primary' }
                                            className="table-checkbox-bulk"
                                            onChange={ handleBulkCheck }/>
                                    ) : (
                                        <span className="thText">
                                            { column.title }
                                            { ( column.sorting && orderBy === column.field ) && ( asc ? <ArrowUpwardIcon/> : <ArrowDownwardIcon/> ) }
                                        </span>
                                    ) }
                                </TableCell>
                            )) ) }
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        { tableData.length ? renderRows(tableData) : renderEmptyRow() }
                    </TableBody>
                </Table>
                { pagination ? (
                    <BackdropBlur tintOpacity={ 0.7 }>
                        <TablePagination
                            rowsPerPageOptions={ DEFAULT_PAGE_SIZE_OPTIONS }
                            component={ 'div' }
                            count={ pagination.total || 1 }
                            rowsPerPage={ apiQuery.limit }
                            page={ apiQuery.offset / apiQuery.limit }
                            onChangePage={ handleChangePage }
                            onChangeRowsPerPage={ handleChangeRowsPerPage }
                            backIconButtonProps={ { 'aria-label': 'Previous Page' } }
                            nextIconButtonProps={ { 'aria-label': 'Next Page' } }
                            className={ 'table__pagination' }
                        />
                    </BackdropBlur>
                ) : null }
            </TableContainer>
        </FilterSimpleTableWrapper>
    );
}, {
    displayName: 'FilterSortSimpleTable'
});

const FilterSimpleTableWrapper = styled.div`
    && {

        .MuiTableContainer-root {
            height: calc(100vh - ${ ( props ) => props.id }px);
        }
        .MuiTableCell-head {
            background-color: #f9f9f9;
        }
        .row-clickable {
            cursor: pointer;
        }
        .row-not-clickable {
            pointer-events: none;
        }
        .table__pagination {
            z-index: 100;
            position: sticky;
            bottom: 0;
            left: 0;
        }
        .table-checkbox-bulk {
            &.MuiCheckbox-indeterminate {
                color: #2196f3;
            }
        }
        .loading-block {
            width: 100vw;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background-color: rgba(255,255,255,0.5);
            pointer-events: none;
            position: absolute;
            top: 0;
            left: 0;
            z-index: 110;

            @media (min-width: 1280px) {
                width: calc(100vw - 300px);
            }
        }
    }
`;
