import React, {
    useEffect,
    useRef,
    useState,
    useContext,
    useCallback
}                     from 'react';
import Typography     from '@material-ui/core/Typography';
import { Form, Formik }       from 'formik';
import {
    BiddingTableWrapper,
    PageHeaderWrapper
}                     from '../../style';
import { SearchField }        from '@packages/form/fields';

import { FilterSortSimpleTable } from '@packages/tables/filter-sort-simple-table';

import { Row }                        from '@components/Layout/Row';
import { PrimaryButton }              from '@components/Buttons';
import { useRouter }                  from '@hooks/useRouter';
import { createMemo }                 from '@packages/react';
import BiddingTimeLeft                from './BiddingTimeLeft';
import BiddingFiltersControl          from './BiddingFiltersControl';
import { DialogApi }                  from '@packages/dialog/createDialog';
import { PlaceBidDialog }             from '@containers/Biddings/components/PlaceBidDialog';
import { BidPlacedDialog }            from '@containers/Biddings/components/BidPlacedDialog';
import { EditProductDialog }          from '@containers/MedicalOrders/components/EditProductDialog';
import { LazyImage }                  from '@packages/image/LazyImage';
import { api }                        from '@lib/http';
import { useUser }                    from '@hooks/useUser';
import { RouterServiceProvider }      from '@packages/router/lib/RouterServiceProvider';
import { isFunction, isNil, isEmpty } from 'lodash';
import { useApp }                     from '@packages/hooks/useApp';
import { useNotify }                  from '@hooks/useNotify';
import { CRUDConfig }                 from '../../Interfaces';
import { NoticeBar }                  from './NoticeBar';
import { BottomPanel }                from './BottomPanel';

import { BiddingsContext }  from '../../context';
import { CloseOrderDialog } from './CloseOrderDialog';

interface BiddingOrderTableProps {
    pageTitle?: string;
    pageType?: string;
    prepareIndexConfig: ( config: CRUDConfig ) => CRUDConfig;
}

export const BiddingOrdersTable = createMemo<BiddingOrderTableProps>(( {
    pageTitle,
    pageType,
    prepareIndexConfig,
} ) => {

    const router = useApp(RouterServiceProvider);
    const { notifySuccess, notifyError } = useNotify();
    const { history } = useRouter();

    const [ state, { setItems, setPagination, setLoading } ] = useContext(BiddingsContext);

    const items = state.get('items');
    const pagination = state.get('pagination');
    const loading = state.get('loading');

    const user = useUser();
    const isAdmin = user.$is('admin');

    const apiQuery = { limit: 50 };

    const [ adminPanelItem, setAdminPanelItem ] = useState<any>(null);

    const [ tableHeight, setTableHeight ] = useState(70);

    const [ selectedItem, setSelectedItem ] = useState(null);

    const [ selectedForClose, setSelectedForClose ] = useState<any>([]);

    const [ bulkBar, setBulkBar ] = useState<number>(0);

    const [ bulkCheck, setBulkCheck ] = useState(false);

    const [ convertToOrderSelection, setConvertToOrderSelection ] = useState<any>({});

    const dialogs = {
        placeBid:    useRef<DialogApi | null>(null),
        bidPlaced:   useRef<DialogApi | null>(null),
        closeDialog: useRef<DialogApi | null>(null),
        editProduct: useRef<DialogApi | null>(null)
    };

    const loadData = async ( query? ) => {
        setLoading(true);

        try {
            const { filter, ...rest } = query || apiQuery;

            let config: any = {
                url:    '',
                params: {
                    filter: {},
                    ...rest
                }
            };

            if ( filter ) {
                Object.keys(filter).forEach(( filterKey ) => {
                    ( config.params as any )[ filterKey ] = filter[ filterKey ];
                    ( config.params as any ).filter[ filterKey ] = filter[ filterKey ];
                });
            }

            if ( isFunction(prepareIndexConfig) ) {
                config = prepareIndexConfig(config);
            }

            if ( isAdmin && config.params.is_open_order ) {
                config.params.is_open_bid = false;
            }

            const { data } = await api.get(config.url, { params: config.params });

            setItems(data.items);
            setPagination(data.pagination);

            setLoading(false);
        } catch ( e ) {
            notifyError(e);
            setLoading(false);
        }
    };

    const renderSku = ( { sku, brand } ) => {
        const { name, preview_photo } = sku;
        return (
            <div className="sku-cell">
                <LazyImage width={ 50 } height={ 50 } src={ preview_photo } thumbnail noMessage borderRadius={ 5 } backgroundColor={ '#ccc' }/>
                <div className="text">
                    <Typography variant="body2" className="cell-title">{ name }</Typography>
                    <Typography variant="body1" className="text-ellipsis">{ brand?.name }</Typography>
                </div>
            </div>
        );
    };

    const renderLocation = ( { location } ) => {
        return (
            <div className="brand-cell">
                { location ? (
                    <>
                        <Typography variant="body2" className="cell-title">{ location?.name }</Typography>
                        <Typography variant="body1" className="text-ellipsis">{ location?.full_address }</Typography>
                    </>
                ) : '-' }
            </div>
        );
    };

    const renderYourBid = ( item ) => {
        const { bid_details, quantity } = item;
        return ( !!( bid_details ) && !!( item?.bid_details?.price ) ? `$${ bid_details.price }/Unit ($${ parseFloat(bid_details.price) * quantity } total)` : '-' );
    };

    const renderProjectedTurnaround = ( item ) => {
        const { bid_details } = item;
        return ( !!( bid_details ) && !!( item?.bid_details?.price ) ? ( bid_details.turnaround + 'Days' ) : '-' );
    };

    const togglePanel = ( item ) => {
        const items$ = [ ...items ];

        if ( ( adminPanelItem && adminPanelItem.id === item.id ) || isEmpty(item) ) {
            items$.map(( row ) => row.rowSelected && ( delete row.rowSelected ));

            setItems(items$);
            setAdminPanelItem(null);
        } else {
            items$.map(( row ) => row.id === item.id ? row.rowSelected = 'row-selected' : delete row.rowSelected);

            setItems(items$);
            setAdminPanelItem(item);
        }
    };

    const viewOrderDetail = ( item ) => {
        const placed = !!( item?.bid_details ) && !!( item?.bid_details?.price );
        const status = getStatus(item, placed);

        let route = 'Bidding.Order.View';

        if ( status === 'WON' ) {
            route = 'Bidding.Order.ViewWon';
        } else if ( status === 'LOST' ) {
            route = 'Bidding.Order.ViewLost';
        }

        router.goTo(route, { id: item.id });
    };

    const handleRowClick = useCallback(( item ) => {
        isAdmin ? togglePanel(item) : viewOrderDetail(item);
    }, [ adminPanelItem, items ]);

    const redirectToView = ( e, { order_id } ) => {
        e.stopPropagation();
        history.push(`/medical-orders/${ order_id }/view`);
    };

    const renderAction = ( item ) => {
        const placed = !!( item?.bid_details ) && !!( item?.bid_details?.price );
        const status = getStatus(item, placed);
        const disableBtn = ( status === 'CLOSED' );

        if ( ( status === 'OPEN' && !placed ) || status === 'CLOSED' ) {
            return (
                <div className="button-bar">
                    <PrimaryButton
                        className={ status === 'OPEN' ? 'button-primary' : 'button-default' }
                        disabled={ disableBtn }
                        onClick={ ( ev ) => handlePlaceBid(ev, item) }>
                        { status === 'OPEN' ? 'Place Bid' : 'Closed' }
                    </PrimaryButton>
                </div>
            );
        } else if ( status === 'OPEN' && placed ) {
            return (
                <div className="button-bar">
                    <PrimaryButton color={ 'grey' } onClick={ ( ev ) => handlePlaceBid(ev, item) } className="button-default">Edit</PrimaryButton>
                    <PrimaryButton color={ 'grey' } onClick={ ( ev ) => handleCancelBid(ev, item) } className="button-default">Cancel</PrimaryButton>
                </div>
            );
        } else {
            return (
                <div className="button-bar">
                    {/* /medical-orders/:id/view */ }
                    <PrimaryButton color={ 'grey' } onClick={ ( e ) => redirectToView(e, item) }>Go To Order</PrimaryButton>
                </div>
            );
        }
    };

    const renderStatus = ( status ) => {
        const statusClass = status === 'CLOSED BY ADMIN' ? 'CLOSED' : status;

        return (
            <div className={ `item-status-block ${ statusClass }` }>{ status }</div>
        );
    };

    const renderTimeLeft = ( field ) => {
        const { bid_close_at, current_time } = field;
        return ( <BiddingTimeLeft endDate={ bid_close_at } currentTime={ current_time }/> );
    };

    const renderStatusColumn = ( field ) => {
        const status = field.bid_closed_by === 'Admin' ? 'CLOSED BY ADMIN' : '';

        if ( pageType === 'WON' || pageType === 'LOST' || status ) {
            return renderStatus(status || pageType);
        } else {
            return renderTimeLeft(field);
        }
    };

    const renderBulkBar = useCallback(() => {
        return (
            <div className="header-bulk-bar">
                <span className="bulk-text">{ bulkBar } selected</span>
                { ( bulkBar === 1 ) && ( <PrimaryButton onClick={ () => handleSelectOrderToConvert('bulk') }>Convert to order</PrimaryButton> ) }
                <PrimaryButton color={ 'grey' } onClick={ () => handleCloseOrder('orderCloseBulk') }>Close</PrimaryButton>
            </div>
        );
    }, [ bulkBar ]);

    const handleSearch = useCallback(( search ) => {
        const value = (typeof search === 'string') ? search : search.target.value;
        const query = { ...apiQuery, q: value };
        loadData(query);
    }, []);

    const openBidPlaced = async ( data ) => {
        await dialogs.bidPlaced.current?.open();

        if ( data.result === 'Bid Placed Successfully!' ) {
            const updateItem = { ...( selectedItem as any ), bid_details: { price: data.price, turnaround: data.turnaround } };
            const updateItems = items.map(( it ) => it.id === updateItem.id ? updateItem : it);
            setItems(updateItems);
        }
    };

    const handlePlaceBid = async ( ev, item ) => {
        ev.stopPropagation();

        await setSelectedItem(item);
        await dialogs.placeBid.current?.open();
    };

    const handleCancelBid = async ( ev, item ) => {
        ev.preventDefault();
        ev.stopPropagation();
        try {
            const { data } = await api.post('medical-bids/cancel',
                {
                    item_id:    item.id,
                    factory_id: user.factory_id
                }
            );

            if ( data === 'Bid Removed Successfully!' ) {
                const cancelItem = { ...item, bid_details: null };
                const updateItems = items.map(( it ) => it.id === item.id ? cancelItem : it);
                setItems(updateItems);
            }
            notifySuccess('Item is cancelled');
        } catch ( e ) {
        }
    };

    const getStatus = ( item, placed ) => {

        let status = 'OPEN';

        if ( !!( item.is_bid_closed ) ) {

            if ( !!( item.factory_id ) ) {
                if ( placed ) {
                    if ( isAdmin ) {
                        status = 'WON';
                    } else {
                        status = ( item.factory_id === user.factory_id ) ? 'WON' : 'LOST';
                    }
                } else {
                    status = 'CLOSED';
                }
            } else {
                status = item.bid_closed_by === 'Admin' ? 'CLOSED_BY_ADMIN' : 'CLOSED';
            }
        }

        return status;
    };

    const handlePagination = ( page ) => {
        loadData(page);
    };

    const handleSelectProduct = ( products ) => {
        const query = { ...apiQuery, sku_id: products, q: '' };
        loadData(query);
    };

    const handleQuantity = ( { from, to, reset } ) => {
        const qu: any = apiQuery;
        let query: any = {};

        if ( reset && !isNil(qu.quantity_minimum) ) {
            const qur: any = { ...apiQuery };
            delete qur.quantity_minimum;
            delete qur.quantity_maximum;

            query = { ...qur, q: '' };
        } else if ( reset ) {
            query = {
                ...apiQuery,
                q: ''
            };
        } else {
            query = {
                ...apiQuery,
                quantity_minimum: Number(from),
                quantity_maximum: Number(to),
                q:                ''
            };
        }

        loadData(query);
    };

    const handleDateRange = ( { from, to } ) => {
        const query = {
            ...apiQuery,
            from,
            to
        };
        loadData(query);
    };

    const columns: any = [
        { title: 'Product/Brand', field: 'sku.name', render: ( item ) => renderSku(item), sorting: true, className: 'cell-first' },
        { title: 'Recipient', field: 'brand.name', render: ( item ) => renderLocation(item), sorting: true, className: 'cell-brand-name' },
        { title: 'Quantity', field: 'quantity', sorting: false, type: 'number' },
        { title: 'Date Created', field: 'bid_start_at', sorting: true, type: 'date' },
        { title: 'Bidding Closes', field: 'bid_close_at', sorting: true, type: 'date' },
        { title: pageType === 'OPEN' ? 'Time Left' : 'Status', field: 'placement_date', render: renderStatusColumn },
        { title: 'Your Bid', field: 'your_bid', render: ( item ) => renderYourBid(item), sorting: true },
        { title: 'Projected Turnaround', field: 'placement_date', render: ( item ) => renderProjectedTurnaround(item), sorting: false }
    ];

    if ( ( isAdmin && pageType === 'WON' ) || ( !isAdmin && pageType !== 'LOST' ) ) {
        columns.push({ title: 'Actions', field: 'action', sorting: false, render: ( item ) => renderAction(item), className: 'cell-actions' });
    }

    if ( isAdmin ) {
        columns.splice(0, 0, { title: 'Ck', field: 'check', sorting: false, className: 'cell-check', type: 'checkbox' });
    }

    const makeTableHeight = () => {
        const header = document.querySelector('#portal__layout-header');
        const mastHead = document.querySelector('.page-masthead');
        const headerHT = header?.getBoundingClientRect().height ?? 70;
        const msHT = mastHead?.getBoundingClientRect().height ?? 0;

        const height = ( msHT + headerHT ) || 70;

        setTableHeight(height);
    };

    useEffect(() => {
        makeTableHeight();
    }, []);

    useEffect(() => {
        loadData();
    }, []);

    const getBulkBar = ( rows ) => {
        const checkedItems = rows.filter(( item ) => item.checked);
        setBulkBar(checkedItems.length);

        const checked = checkedItems.length === items.length;

        setBulkCheck(checked);
    };

    const handleBulkCheck = useCallback(( checked ) => {
        const items$ = [ ...items ];
        items$.map(( row ) => row.checked = checked);

        getBulkBar(items$);
        setItems(items$);
        setBulkCheck(checked);
    }, [ bulkCheck, items ]);

    const handleRowCheck = useCallback(( { checked, id } ) => {
        const items$ = [ ...items ];
        items$.map(( row ) => row.id === id && ( row.checked = checked ));

        getBulkBar(items$);

        setItems(items$);
    }, [ items ]);

    const handleCloseOrder = ( value ) => {
        if ( value === 'orderCloseDialog' ) {
            const adminPanelItem$ = [ adminPanelItem ];
            setSelectedForClose(adminPanelItem$);
        }
        if ( value === 'orderCloseBulk' ) {
            const checkedItems = items.filter(( item ) => item.checked);
            setSelectedForClose(checkedItems);
        }

        dialogs.closeDialog.current?.open();
    };

    const setRemoveClass = ( item, disableClick? ) => {
        const items$ = [ ...items ];
        items$.forEach(( row ) => {
            if ( row.id === item.id ) {
                row.redClass = 'row-deleted';
                row.checkDisabled = true;
                row.checked = false;
                setBulkBar(0);
                setBulkCheck(false);
                disableClick && ( row.notClickable = true );
            }
        });

        return items$;
    };

    const handleAwardOrder = useCallback(( item ) => {
        const items$ = setRemoveClass(item, true);
        setItems(items$);
    }, [ items, bulkBar ]);

    const convertToOrder = useCallback(( item ) => {
        const items$ = setRemoveClass(item, true);
        setItems(items$);
    }, [ items, bulkBar ]);

    const onCloseOrder = useCallback(async ( value ) => {
        if ( value && value === 'close' ) {
            try {
                const ids$ = selectedForClose.map(( item ) => item.id);

                await api.post('apparel-items/close-bids', { item_ids: ids$ });

                const items$ = [ ...items ];
                items$.forEach(( item ) => {
                    const findId = ids$.find(( id ) => id === item.id);
                    if ( findId ) {
                        item.redClass = 'row-deleted';
                        item.bid_closed_by = 'Admin';
                        setRemoveClass(item);
                    }
                });

                if ( adminPanelItem ) {
                    const adminPanelItem$ = { ...adminPanelItem };
                    adminPanelItem$.bid_closed_by = 'Admin';
                    setAdminPanelItem(adminPanelItem$);
                }

                setItems(items$);
            } catch ( e ) {
                notifyError(e);
            }
        }
    }, [ items, selectedForClose, adminPanelItem ]);

    const handleSelectOrderToConvert = useCallback(( value ) => {
        if ( value === 'bulk' ) {
            const selection$: any = items.filter(( item ) => item.checked)[ 0 ];
            setConvertToOrderSelection(selection$);
        } else {
            setConvertToOrderSelection(adminPanelItem);
        }

        dialogs.editProduct.current?.open();
    }, [ convertToOrderSelection, items ]);

    return (
        <BiddingTableWrapper>
            <PageHeaderWrapper className="page-masthead">
                <div className="bar-left">
                    <Typography variant="h5" className="table-title">{ pageTitle }</Typography>
                    <Formik initialValues={ { q: '' } } onSubmit={ handleSearch }>{ () => (
                        <Row component={ Form } align={ 'center' }>
                            <SearchField onSubmit={ handleSearch } onBlur={ handleSearch } />
                        </Row>
                    ) }</Formik>
                </div>
                <div className="table-control-bar">
                    { <BiddingFiltersControl
                        selectProduct={ handleSelectProduct }
                        selectQuantity={ handleQuantity }
                        selectDateRange={ handleDateRange }/> }
                </div>

                { ( bulkBar >= 1 ) && ( renderBulkBar() ) }
            </PageHeaderWrapper>

            <FilterSortSimpleTable
                title={ pageTitle }
                tableWrapperClass={ 'bidding-main-table' }
                data={ items }
                allowHoverRows={ true }
                checkable={ isAdmin }
                tableHeight={ tableHeight }
                columns={ columns }
                bulkCheck={ bulkCheck }
                onRowClick={ handleRowClick }
                onBulkCheck={ handleBulkCheck }
                onRowCheck={ handleRowCheck }
                onPagination={ handlePagination }
                loading={ loading }
                pagination={ pagination }/>

            { !isAdmin && <NoticeBar/> }

            { adminPanelItem && (
                <BottomPanel
                    itemId={ adminPanelItem.id }
                    itemClosedBy={ adminPanelItem.bid_closed_by }
                    closePanel={ togglePanel }
                    onConvertDialog={ handleSelectOrderToConvert }
                    orderCloseDialog={ handleCloseOrder }
                    onAwardOrder={ handleAwardOrder }
                />
            ) }

            <PlaceBidDialog
                apiRef={ dialogs.placeBid }
                item={ selectedItem }
                onSubmit={ openBidPlaced }/>

            <BidPlacedDialog apiRef={ dialogs.bidPlaced }/>

            <CloseOrderDialog
                onClose={ onCloseOrder }
                selected={ selectedForClose }
                apiRef={ dialogs.closeDialog }/>

            <EditProductDialog
                title={ 'Convert to Order' }
                onSubmit={ convertToOrder }
                apiRef={ dialogs.editProduct }
                selections={ convertToOrderSelection }
                isBidding={ true }
                isAdmin={ isAdmin }
                isConvertToOrder={ true }
            />

        </BiddingTableWrapper>
    );
}, {
    displayName: 'BiddingOrdersTable    '
});
