import styled                 from 'styled-components';
import { color }              from '@packages/style/colors';
import Menu                   from '@material-ui/core/Menu/Menu';
import MenuItem               from '@material-ui/core/MenuItem';

export const ListContainer = styled.div`
    width: 100%;
    flex: 1;
    background-color: #fff;
`;

export const BiddingTableWrapper = styled.div`
    && {
        width: 100%;
        position: relative;

        .bidding-main-table {
            .filter-sort-table:not(.empty-table) {
                min-width: 1250px;
                border: 1px solid rgba(224, 224, 224, 1);
            }
        }
        .MuiTableHead-root {
            .MuiTableRow-root {
                vertical-align: top;
            }
            .MuiTableCell-root {
                padding-top: 10px;
            }
        }

        .MuiTableRow-root {
            transition: all 0.25s ease-in;
        }

        td {
            padding: 4px 10px 4px 10px;
            font-weight: 400;
            height: 55px;
        }

        .row-selected {
            background-color: ${ color('lighterBlue') };

            .cell-actions,
            &.MuiTableRow-hover:hover {
                background-color: ${ color('lighterBlue') };
            }
        }

        .row-deleted {
            background-color: #ffe3e2;

            .cell-actions,
            &.MuiTableRow-hover:hover {
                background-color: #ffe3e2;
            }
        }

        .cell-check {
            text-align: center;
            border-right: 1px solid #ddd;
            pointer-events: none;

            * {
                pointer-events: auto;
            }
        }
        .cell-first {
            max-width: 250px;
            border-right: 1px solid #ddd;
        }
        .cell-brand-name {
            max-width: 150px;
        }
        .cell-actions {
            text-align: center;
            border-left: 1px solid #ddd;            
        }
        
        .table-checkbox-bulk,
        .table-checkbox {
            margin: -9px;
        }

        .button-bar {
            display: flex;
            flex-direction: row;

            .MuiButton-root {
                font-size: .95em;
                flex: 1;
            }
        }

        .sku-cell {
            .lazy-image {
                width: 50px;
                float: left;
                border: 1px solid rgba(0,0,0,0.15);

                img {
                    object-fit: fill;
                }
            }
            .text {
                padding-top: 5px;
                padding-left: 60px;
            }
        }
        .text-ellipsis {
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
        }
        .brand-cell {

        }
        .select-box {
            width: 100%;
            margin-bottom: 10px;
        }
        .form-group-button {
            width: 100%;
            padding-right: 25px;
            margin-bottom: 10px;
            color: rgba(0, 0, 0, 0.54);
            text-transform: capitalize;
            font-weight: 400;
            position: relative;

            &::after {
                width: 0;
                height: 0;
                content: '';
                border-left: 4px solid transparent;
                border-right: 4px solid transparent;
                border-top: 4px solid rgba(0,0,0,0.54);
                position: absolute;
                top: 50%;
                right: 8px;
                transform: translateX(-50%) translateY(-50%);
            }
        }
        
        .bar-left {
            form {
                width: calc(100% - 50px);
                flex: 1;
            }
        }

        .control-toggle-button {
            position: absolute;
            top: -42px;
            right: 0;
        }

        .table-control-bar {
            position: relative;

            .MuiOutlinedInput-input {
                padding: 10.5px 14px;
            }
            .MuiSelect-select {
                min-width: 120px;
            }
            .MuiInputLabel-formControl {
                transform: translate(10px, 12px) scale(1);

                &.MuiInputLabel-shrink {
                    transform: translate(0, -12px) scale(0.75);
                }
            }
        }
        .table-control-bar-form {
            width: 100%;
            max-width: 250px;
            padding: 15px;
            background-color: #fff;
            border-radius: 4px;
            box-shadow: 0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12);
            opacity: 0;
            visibility: hidden;
            z-index: 101;
            position: absolute;
            top: 100%;
            right: 0;

            &.active {
                opacity: 1;
                visibility: visible;    
            }
        }

        .item-status-block {
            padding: 5px 10px;
            color: #fff;
            font-size: 0.9em;
            display: inline-block;
            background-color: ${ color('primary') };

            &.LOST,
            &.CLOSED {
                background-color: ${ color('red') };
            }
        }

        .notice-bar {
            z-index: 100;
            position: absolute;
            bottom: 15px;
            left: 15px;
        }
        .info-box {
            width: 350px;
            max-width: 100%;
            background-color: #fff;
            box-shadow: 0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12);
            border-radius: 4px;

            .info-box-head {
                width: 100%;
                padding: 5px 15px 0 15px;
                margin: 0;
                display: flex;
                flex-direction: row;
                justify-content: flex-end;
                cursor: pointer;
            }
            .info-box-text {
                padding: 0 15px 5px 15px;
            }
        }

        @media (min-width: 768px) {

            .bar-left {
                .table-search {
                    width: auto;
                }
            }
            .control-toggle-button {
                top: -30px;
            }
            .cell-actions {
                max-width: 250px;
                background-color: #fff;
                border-left: 0;
                box-shadow: -1px 0px 1px rgba(0,0,0,0.1), 1px -1px 1px rgba(255,255,255,1);
                z-index: 2;
                position: sticky;
                top: auto;
                right: 0;

                &.MuiTableCell-head {
                    background-color: #f9f9f9;
                }    
            }
            
            .notice-bar {
                left: 20px;
                bottom: 20px;
            }
        }

        @media (min-width: 960px) {
            .bidding-main-table {
                .filter-sort-table:not(.empty-table) {
                    min-width: 1650px;
                }
            }
        }

        @media (min-width: 1200px) {
            .control-toggle-button {
                display: none;
            }
            .table-control-bar-form {
                max-width: none;
                padding: 0px;
                background-color: transparent;
                border-radius: 0px;
                box-shadow: none;
                position: static;
                opacity: 1;
                visibility: visible;

                display: flex;
                flex: 1;
                flex-direction: row;
                justify-content: flex-end;
                margin-right: -10px;
            }
            .select-box {
                width: auto;
                max-width: 145px;
                margin-bottom: 0px;
                margin-right: 10px;
            }
            .form-group-button {
                width: auto;
                margin-bottom: 0px;
                margin-right: 10px;
            }
        }
}`;

export const PageHeaderWrapper = styled.header`
    && {
        padding: 16px;
        background-color: #f9f9f9;
        position: relative;

        .table-title {
            margin-bottom: 10px;
            text-align: center;
        }
        .table-search {
            width: 100%;
        }

        .header-bulk-bar {
            padding: 16px;
            background-color: #f9f9f9;
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: center;
            z-index: 101;
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;

            .MuiButtonBase-root {
                min-width: 180px;
            }
            .bulk-text {
                margin-right: 10px;
            }
        }

        @media (min-width: 768px) {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;

            .bar-left {
                display: flex;
                flex-direction: row;
                justify-content: flex-start;
                align-items: center;
            }
            .table-control-bar {
                display: flex;
                flex: 1;
                flex-direction: row;
                justify-content: flex-end;
                align-items: center;
            }
            .table-title {
                padding-right: 20px;
                margin-bottom: 0;
                text-align: left;
                white-space: nowrap;
            }
            .table-search {
                width: auto;
            }
        }
    }
`;

export const FilterMenu = styled(Menu)`
&& {
    .MuiMenu-paper {
        padding: 10px 12px 5px;
    }
    [autofocus]:focus {
        outline: 0;
    }
}`;

export const PriceRangeBox = styled.div`
&& {
    width: 300px;

    .input-row {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }
    .form-group {
        flex: 1;

        > div {
            margin-top: 0;
            margin-bottom: 10px;
        }
    }
    .input-to {
        width: 25px;
        padding-top: 10px;
        text-align: center;
    }
    .button-bar {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        margin-left: -5px;
        margin-right: -5px;
        
        button {
            flex: 1;
            margin-left: 5px;
            margin-right: 5px;
        }
    }
}`;

export const TimeLeftWrap = styled.div`
    && {
        display: flex;
        flex-direction: row;
        align-items: center;
        position: relative;
        z-index: 1;

        .unit {
            margin: 4px 2px 2px 2px;
            text-align: center;

            &.expired {
                .digit {
                    width: 134px;
                    height: 36px;
                    line-height: 36px;
                }
                .digit::after,
                & ~ .unit .digit::after {
                    background-color: ${ color('error') };
                }
            }
            &.no-days {
                .digit::after {
                    background-color: ${ color('grey') };
                }
                & ~ .unit .digit::after {
                    opacity: 0.6;
                    background-color: ${ color('yellow') };
                }
            }
            &.no-days-and-hours {
                .digit::after {
                    background-color: ${ color('grey') };
                }
                & ~ .unit:nth-child(2) .digit::after {
                    background-color: ${ color('grey') };
                }
                & ~ .unit .digit::after {
                    background-color: ${ color('error') };
                }
            }
        }

        .digit {
            min-width: 30px;
            height: 30px;
            padding-left: 5px;
            padding-right: 5px;
            line-height: 30px;
            color: #000;
            display: block;
            position: relative;

            &::after {
                width: 100%;
                height: 100%;
                content: '';
                display: block;
                opacity: 0.4;
                background-color: ${ color('primary') };
                pointer-events: none;
                z-index: -1;
                position: absolute;
                top: 0;
                left: 0;
            }
        }
        .unit-label {
            font-size: 0.8em;
            text-transform: capitalize;
        }
    }
`;

export const DateRangeWrapper = styled.div`
    && {
        position: relative;

        .date-picker-component {
            z-index: 10;
            position: absolute;
            top: 100%;
            right: 0;
        }
    }
`;

export const StickyField = styled(MenuItem)`
    && {
        z-index: 10;
        position: sticky;
        bottom: 0;
        left: 0;
        background-color: #fff;
        box-shadow: 0 -1px 3px rgba(0,0,0,.1);

        &:hover {
            background-color: #eee;
        }

        button {
            width: 100%;
        }

    }
`;

export const ProductImage = styled.div`
    && {
        max-width: 100%;
        position: relative;

        .product-status {
            z-index: 2;
            position: absolute;
            top: 10px;
            left: 15px;
        }

        .lazy-image {
            max-width: 100%;
            border: 1px solid rgba(0,0,0,0.15);
        }
        .lazy-image__image {
            object-fit: fill;
        }
    }
`;

export const ActionButtons = styled.div`
    && {
        padding-top: 10px;
        padding-bottom: 10px;

        button {
            margin-left: 0;
            margin-right: 12px;
        }
        .btn-lg {
            min-width: 200px;
        }
    }
`;
export const Ol = styled.ol`
    && {
        padding-left: 15px;
        margin-bottom: 10px;
        
        li {
            padding-left: 15px;
            margin-bottom: 10px;
        }
    }
`;