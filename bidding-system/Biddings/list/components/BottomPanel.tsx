import React, {
    useState,
    useEffect,
    useCallback }                               from 'react';
import { createMemo }                           from '@packages/react';
import { call }                                 from '@packages/functions';
import { useNotify }                            from '@hooks/useNotify';
import styled                                   from 'styled-components';
import { api }                                  from '@lib/http';
import { InlineLoading }                        from '@components/InlineLoading';
import { PrimaryButton }                        from '@components/Buttons';
import IconButton                               from '@material-ui/core/IconButton';
import CloseIcon                                from '@material-ui/icons/Close';
import CallMadeIcon                             from '@material-ui/icons/CallMade';
import CallReceivedIcon                         from '@material-ui/icons/CallReceived';
import { LazyImage }                            from '@packages/image/LazyImage';
import Typography                               from '@material-ui/core/Typography';
import { formatDate }                           from '@lib/datetime';
import BiddingTimeLeft                          from './BiddingTimeLeft';
import { BottomPanelTable }                     from './BottomPanelTable';

interface BottomPanelProps {
    itemId?: number;
    itemClosedBy?: string;
    closePanel?: ( item: any ) => void;
    orderCloseDialog?: ( item: any ) => void;
    onConvertDialog?: ( convert: string ) => void;
    onAwardOrder?: ( id: number ) => void;
}

const FIELDS = 'id, vendors, location{ name, address_1, city, state, zip, country_name }, sku{id, name, preview_photo, factories }, brand{ id, name }, quantity, shipping_cost, bid_start_at, bid_close_at, current_time, order_id, factory_id, is_bid_closed, bid_closed_by, bid_details, user { email, phone }';

export const BottomPanel = createMemo<BottomPanelProps>(( {
    itemId,
    itemClosedBy,
    closePanel,
    orderCloseDialog,
    onConvertDialog,
    onAwardOrder
}) => {

    const notify = useNotify();
    const [ isLoading, setIsloading ] = useState(true);
    const [ product, setProduct ] = useState<any>([]);
    const [ slideDown, setSlideDown ] = useState(false);
    const [ popOut, setPopOut ] = useState(false);

    const loadItem = async () => {
        setIsloading(true);
        setSlideDown(false);

        const { data } = await api.get('medical-bids', {
            params: {
                item_id:     itemId,
                return_only: FIELDS
            }
        });

        const data$ = data.items[ 0 ];

        const details = data$?.bid_details ?? [];

        const items$ = details.map((detail) => {

            const shipping_cost = Number(data$.shipping_cost) * Number(data$.quantity);
            const profit = ( (Number(detail.price) - Number(data$.shipping_cost)) * Number(data$.quantity) );

            const vendor$ = {
                factory_id:     detail.factory_id,
                name:           detail.factory_name,
                price:          detail.price,
                turnaround:     detail.turnaround ? detail.turnaround + ' Days' : '-',
                shipping_cost:  -shipping_cost,
                total:          Number(detail.price) * Number(data$.quantity),
                factory_sku_id: detail.factory_sku_id,
                profit
            };

            return vendor$;
        });

        data$.vendors = items$;

        setProduct( data$ );
        setIsloading( false );
    };

    useEffect(() => {
        loadItem();

        return () => {
            setProduct([]);
        };
    }, [ itemId ]);

    const handleClosePanel = useCallback(() => {
        call(closePanel, product);
    }, []);

    const handleCloseOrder = useCallback(() => {
        call(orderCloseDialog, 'orderCloseDialog');
    }, [ orderCloseDialog ]);

    const handleConvertOrder = useCallback(() => {
        call(onConvertDialog, 'onConvertDialog');
    }, [ onConvertDialog ]);

    const handleAwardOrder = useCallback(async ( item ) => {
        try {
            await api.put(`apparel-items/${ itemId }`, {
                sku_id:         product.sku.id,
                quantity:       product.quantity,
                brand_id:       product.brand.id,
                item_id:        product.id,
                order_id:       product.order_id,
                shipping_cost:  Number(product.shipping_cost),
                price:          item.total,
                price_single:   Number(item.price),
                is_open_order:  false,
                is_medical:     true,
                factory_sku_id: item.factory_sku_id,
            });

            const product$ = { ...product };
            product$.vendors.map((row) => row.factory_id === item.factory_id && (row.rowSelected = 'row-selected'));
            product$.orderAwarded = true;

            setProduct( product$ );

            call(onAwardOrder, product);
        }
        catch ( e ) {
            notify.error(e);
        }
    }, [ product ]);

    const toggleSlide = () => {
        setSlideDown( !slideDown );
    };

    const togglePop = () => {
        const sidebar: any = document.querySelector('#app__content');
        popOut ? sidebar.removeAttribute('style') : sidebar.style.zIndex = 4;
        setPopOut( !popOut );
    };

    const renderMainDetail = () => {
        return (
            <div className="main-block">
                <div className="row-main mb-30">
                    <LazyImage
                        className="image"
                        src={ product?.sku?.preview_photo }
                        thumbnail
                        noMessage
                        border={ '2px solid #ddd' }
                        backgroundColor={ '#fff' }/>
                    <div className="col text">
                        <div className="mb-10">
                            <Typography className="title" variant={ 'subtitle2' }> { product?.sku?.name } </Typography>
                            <Typography variant={ 'body1' } className="mb-10"> { product?.brand?.name } </Typography>

                            <Typography variant={ 'body1' }><span className="caption">Order Number: </span>{ product?.order_id || '000' }</Typography>
                            <Typography variant={ 'body1' }><span className="caption">Quantity: </span> { product?.quantity }</Typography>
                        </div>

                        <div className="panel-button-bar">
                            <PrimaryButton
                                className="button-item-action"
                                color={ 'dark' }
                                disabled={ product.bid_closed_by === 'Admin' || itemClosedBy === 'Admin' }
                                onClick={ handleCloseOrder }>
                                Close
                            </PrimaryButton>
                            <PrimaryButton
                                className="button-item-action"
                                color={ 'dark' }
                                onClick={ handleConvertOrder }>
                                Convert to order
                            </PrimaryButton>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderRecipient = () => {
        return (
            <>
                <Typography className="caption" variant={ 'caption' }>Recipient</Typography>
                <Typography variant={ 'body1' }>{ product?.location?.name }</Typography>
                <Typography variant={ 'body1' }>{ product?.location?.address_1 }</Typography>
                <Typography variant={ 'body1' }>{ product?.location?.city }{ product?.location?.city && product?.location?.state ? ', ' : '' }{ product?.location?.state } { product?.location?.zip }
                </Typography>
                <Typography variant={ 'body1' }>{ product?.location?.country_name }</Typography>
            </>
        );
    };

    const renderDates = () => {
        return (
            <div className="dates-row">
                <div className="dates-col">
                    <Typography className="caption" variant={ 'caption' }>Date Created</Typography>
                    <Typography variant={ 'body1' } className="mb-20">{ formatDate( 'human', product?.bid_start_at || '') }</Typography>
                </div>
                <div className="dates-col">
                    <Typography className="caption" variant={ 'caption' }>Expiration Date</Typography>
                    <Typography variant={ 'body1' }>{ formatDate( 'human', product?.bid_close_at || '') }</Typography>
                </div>
            </div>
        );
    };

    return (
        <PanelBlock className={ `bottom-panel ${ slideDown && 'down' } ${ popOut && 'pop-out' }` }>
            <button className="handle-bar" onClick={ toggleSlide }>
                <div className="handle-button"></div>
            </button>
            <div className="panel-body">
                { isLoading  ? <InlineLoading /> : (
                    <div className="panel-contents">

                        <div className="panel-detail-block">
                            <div className="action-bar">
                                <IconButton onClick={ togglePop }>
                                    { popOut ? <CallReceivedIcon style={ { fontSize: '1em' } } /> : <CallMadeIcon style={ { fontSize: '1em' } } /> }
                                </IconButton>
                                <IconButton onClick={ handleClosePanel }><CloseIcon style={ { fontSize: '1em' } } /></IconButton>
                            </div>

                            { renderMainDetail() }

                            <div className="row">
                                <div className="col recipient mb-30">
                                    { renderRecipient() }
                                </div>
                                <div className="col dates col-double mb-30">
                                    { renderDates() }
                                </div>
                                <div className="col time-left">
                                    <Typography className="caption" variant={ 'caption' }>Time Left</Typography>
                                    <BiddingTimeLeft
                                        endDate={ product?.bid_close_at ?? '' }
                                        currentTime={ product?.current_time ?? '' } />
                                </div>
                            </div>
                        </div>
                        <div className="panel-table-block">
                            <Typography variant={ 'subtitle2' }> { product?.sku?.name } </Typography>
                            <BottomPanelTable orderAwarded={ product.orderAwarded }items={ product.vendors } onVendorSelection={ handleAwardOrder } />
                        </div>

                    </div>
                )}
            </div>
        </PanelBlock>

    );
}, { displayName: 'BottomPanel' });

const PanelBlock = styled.div`
    && {
        width: 100%;
        z-index: 150;
        position: absolute;
        left: 0;
        bottom: 0;

        &.down {
            .panel-body {
                display: none;
            }
        }

        &.pop-out {
            width: 100%;
            height: 100%;
            position: fixed;
            top: 0;
            left: 0;

            &::before {
                width: 100%;
                height: 100%;
                content: '';
                display: block;
                background-color: rgba(0, 0, 0, 0.5);
                z-index: 1;
                position: absolute;
                top: 0;
                left: 0;
            }

            .handle-bar {
                display: none;
            }

            .panel-body {
                width: 75vw;
                max-height: 75vh;
                z-index: 2;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translateY(-50%) translateX(-50%);                    
            }
        }

        .handle-bar {
            width: 100%;
            padding: 7px 10px;
            margin: 0;
            text-align: center;
            background-color: #f2f2f2;
            border: 0;
            outline: 0;
            cursor: pointer;
            position: absolute;
            left: 0;
            top: 0;
            transform: translateY(-100%);

            .handle-button {
                width: 35px;
                padding-top: 1px;
                padding-bottom: 1px;
                margin-left: auto;
                margin-right: auto;
                border-top: 2px solid rgba(0,0,0,0.3);
                border-bottom: 2px solid rgba(0,0,0,0.3);
            }
        }

        .panel-body {
            max-height: 40vh;
            overflow-y: auto;
            background-color: #f9f9f9;
            border: 1px solid #d7d7d7;
        }
        .panel-detail-block,
        .panel-table-block {
            padding: 15px;
        }
        .main-block {
            position: relative;
        }

        .panel-button-bar {
            margin-left: -6px;
            margin-right: -6px;
        }

        .image {
            width: 80px;
            height: 80px;
            margin-bottom: 10px;
        }

        .mb-10 {
            margin-bottom: 10px;
        }
        .mb-20 {
            margin-bottom: 20px;
        }
        .mb-30 {
            margin-bottom: 30px;
        }

        .action-bar {
            z-index: 2;
            position: absolute;
            top: 10px;
            right: 15px;

            .MuiIconButton-root {
                padding: 5px;
                font-size: 1.125rem;
            }
        }

        @media (min-width: 600px) {
            .image {
                margin-bottom: 0px;
            }    
            .row {
                margin-left: -5px;
                margin-right: -5px;
                display: flex;
                flex-direction: row;
                flex-wrap: wrap;
            }
            .col {
                flex: 1;
                padding-left: 5px;
                padding-right: 5px;
            }
            .caption {
                color: rgba(0,0,0,0.6);
            }
            .time-left {
                min-width: 100%;
            }
        }

        @media (min-width: 768px) {
            .panel-table-wrapper {
                margin-left: -15px;
                margin-right: -15px;
                
            }
            &.pop-out {
                .image {
                    width: 100px;
                    height: 100px;
                }
        
                .col-double {
                    flex: 2;
                }
    
                .dates-row {
                    display: flex;
                    flex-direction: row;
                }
                .dates-col {
                    flex: 1;
                }
    
                .time-left {
                    min-width: auto;
                }
                
                .row-main {
                    display: flex;
                    flex-direction: row;
                    flex-wrap: wrap;    
                }
                .image {
                    width: 125px;
                    height: 125px;
                }    
                .text {
                    padding-left: 15px;
                }
                .title {
                    padding-right: 55px;
                }
                .panel-table-block {
                    border-top: 1px solid #ddd;
                }
                .button-item-action {
                    min-width: 180px;
                }              
            }
            &:not(.pop-out) {
                .panel-contents {
                    &::before,
                    &::after {
                        display: table;
                        content: '';
                    }
                    &::after {
                        clear: both;
                    }
                }
                .panel-detail-block {
                    width: 35%;
                    float: right;
                    flex: 0 0 35%;
                    margin-bottom: 0;
                    border-left: 1px solid #ddd;
                }
                .panel-table-block {
                    width: calc(65% + 1px);
                    margin-bottom: 0;
                    margin-right: -1px;
                    float: left;
                    border-right: 1px solid #ddd;
                }
            }
        }
        @media (min-width: 1600px) {
            .image {
                width: 125px;
                height: 125px;
            }
            .row-main {
                display: flex;
                flex-direction: row;
                flex-wrap: wrap;    
            }
            .text {
                padding-left: 15px;
            }
            .title {
                padding-right: 55px;
            }
            .button-item-action {
                min-width: 180px;
            }
            .time-left {
                min-width: auto;
            }
        }
    }
`;
