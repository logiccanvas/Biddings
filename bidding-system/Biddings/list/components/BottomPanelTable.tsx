import React, { useCallback }                   from 'react';
import { createMemo }                           from '@packages/react';
import styled                                   from 'styled-components';
import Typography                               from '@material-ui/core/Typography';
import { PrimaryButton }                        from '@components/Buttons';
import { FilterSortSimpleTable }                from '@packages/tables/filter-sort-simple-table';
import { call }                                 from '@packages/functions';

interface BottomPanelTableProps {
    items?: any;
    onVendorSelection?: ( id: any ) => void;
    orderAwarded?: boolean;
}

export const BottomPanelTable = createMemo<BottomPanelTableProps>(( { items, orderAwarded, onVendorSelection }) => {

    const handleClick = useCallback((e, item) => {
        e.stopPropagation();
        call(onVendorSelection, item );
    }, [ items ]);

    const columns = [
        { title: 'Vendor', field: 'name', render: (item) => renderName(item), className: 'cell-brand-name' },
        { title: 'Bid/Unit', field: 'price', type: 'currency' },
        { title: 'Turnaround', field: 'turnaround', sorting: false },
        { title: 'Items Total', field: 'total', type: 'currency' },
        { title: 'Shipping Cost', field: 'shipping_cost', type: 'currency' },
        { title: 'Estimated Profit', field: 'profit', type: 'currency' },
        { title: '', field: 'action', render: (item) => renderAction(item), className: 'cell-actions' }
    ];

    const renderName = ({ name }) => {
        const randomColor = Math.floor(Math.random()*16777215).toString(16);
        const acronym = name?.substr(0, 1);

        return (
            name ? (
                <div className="brand-cell">
                    <span
                        className="cell-acronym"
                        style={ { backgroundColor: '#' + randomColor } }>
                        { acronym }
                    </span>
                    <Typography
                        variant="body1"
                        className="cell-title">
                        { name }
                    </Typography>
                </div>
            ) : '-'
        );
    };

    const renderAction = ( item ) => {
        return (
            <PrimaryButton
                className="action-button"
                disabled={ orderAwarded }
                onClick={ (event) => handleClick(event, item) }>
                { (orderAwarded && item.rowSelected) ? 'Awarded' : 'Award Order' }
            </PrimaryButton>
        );
    };

    return (
        <TableWrapper className="panel-table-wrapper">
            <FilterSortSimpleTable
                tableWrapperClass={ 'bottom-panel-table' }
                data={ items }
                allowHoverRows={ true }
                columns={ columns } />
        </TableWrapper>
    );
}, { displayName: 'BottomPanelTable' });

const TableWrapper = styled.div`
    && {
        flex: 1;
        background-color: #fff;
        
        .MuiTableContainer-root {
            height: auto;
        }
        .MuiPaper-elevation1 {
            box-shadow: none;
        }

        .bottom-panel-table {
            .cell-brand-name {
                min-width: 200px;
            }
            .cell-actions {
                max-width: 150px;
                
                &.MuiTableCell-head {
                    box-shadow: none;
                }
            }
            .MuiButton-root {
                width: calc(100% - 10px);
                font-size: 0.8rem;
            }
        }
        .MuiTable-root:not(.empty-table) {
            min-width: 1000px;
        }

        .brand-cell {
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: center;
        }
        .cell-acronym {
            width: 30px;
            min-width: 30px;
            height: 30px;
            margin-right: 10px;
            color: #fff;
            text-transform: uppercase;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }
`;