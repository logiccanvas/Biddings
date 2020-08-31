import React, { useRef, useState, useEffect }                  from 'react';
import { Layout }                         from '@packages/layout';
import { Flex, InlineFlex }        from '@components/Layout/Blocks';
import { InlineLoading }                  from '@components/InlineLoading';
import { Container }                      from '@components/Layout/Container';
import { Row }                            from '@components/Layout/Row';
import { Col }                            from '@components/Layout/Col';
import Typography                         from '@material-ui/core/Typography';
import IconButton                         from '@material-ui/core/IconButton';
import Icon                               from '@material-ui/core/Icon';
import { LazyImage }                      from '@packages/image/LazyImage';
import { PrimaryButton }  from '@components/Buttons';
import { createMemo }                     from '@packages/react';
import { DialogApi }                      from '@packages/dialog/createDialog';
import { PlaceBidDialog }                 from '@containers/Biddings/components/PlaceBidDialog';
import { BidPlacedDialog }                from '@containers/Biddings/components/BidPlacedDialog';
import BiddingTimeLeft                    from '@containers/Biddings/list/components/BiddingTimeLeft';
import { useParams, useRouter }           from '@hooks/useRouter';
import { api }                            from '@lib/http';
import { formatDate }                     from '@lib/datetime';
import { useUser }                        from '@hooks/useUser';
import { BidWonMarker }                   from '@containers/Biddings/components/BidWonMarker';
import { BidLostMarker }                  from '@containers/Biddings/components/BidLostMarker';
import { BidClosedMarker }                from '@containers/Biddings/components/BidClosedMarker';
import { route }                          from '@packages/router';
import { useMediaQuery }                  from '@hooks/useMediaQuery';
import { BidNotes }                       from '../components/BidNotes';
import { ProductImage, ActionButtons }    from '../style';

const TextLine = createMemo<any>( ( {
    title,
    content
}) => {
    return (
        <Row>
            <Typography variant={ 'body2' } style={ { 'marginRight': '0.5rem' } }> { title } </Typography>
            <Typography variant={ 'body1' }> { content } </Typography>
        </Row>
    );
}, {
    displayName: 'TextLine'
});

const OpenOrderView = createMemo<any>( ( ) => {
    const user = useUser();
    const params = useParams();
    const [ isLoading, setIsloading ] = useState(false);
    const [ item, setItem ] = useState<any>({});
    const [ status, setStatus ] = useState('OPEN');
    const [ hasBid, setHasBid ] = useState(false);
    const { history } = useRouter();

    const isTab = useMediaQuery('(min-width: 768px)');
    const isDesktop = useMediaQuery('(min-width: 1200px)');

    useEffect( () => {
        loadItem();
    }, []);

    useEffect( () => {
        if ( item ){
            setHasBid( !!(item?.bid_details) && !!(item?.bid_details?.price) );
            if ( item?.is_bid_closed )
            {

                if ( !!(item?.factory_id) )
                {
                    if ( !!(item?.bid_details) && !!(item?.bid_details?.price) )
                    {
                        if ( item?.factory_id === user.factory_id )
                        {
                            setStatus('WON');
                        }
                        else
                        {
                            setStatus('LOST');
                        }
                    }
                    else
                    {
                        setStatus('CLOSED');
                    }
                }
                else
                {
                    setStatus('CLOSED');
                }
            }
        }
        else
        {
            setStatus('');
        }
    }, [ item ]);
    const loadItem = async () => {
        setIsloading(true);
        const { data } = await api.get('medical-bids', {
            params: {
                item_id:     params.id,
                return_only: 'id,location,sku{name,preview_photo},brand{name},quantity,created_at,bid_start_at,bid_close_at,current_time,order_id,factory_id,is_bid_closed,bid_details,user{email,phone}'
            }
        });
        setItem(data.items[ 0 ]);
        setIsloading(false);
    };

    const dialogs = {
        placeBid:  useRef<DialogApi | null>(null),
        bidPlaced: useRef<DialogApi | null>(null),
    };

    const openPlaceBid = async () => {
        await dialogs.placeBid.current?.open();
    };

    const openBidPlaced = async ( data ) => {
        console.log( data );
        await dialogs.bidPlaced.current?.open();
        loadItem();
    };

    const handleCancelBid = async () => {
        await api.post('medical-bids/cancel',
            {
                item_id:    item.id,
                factory_id: user.factory_id
            }
        );

        loadItem();
    };

    const handleBack = () => {
        history.push(route('Bidding.Order.OpenBids'));
    };

    const getActionButtons = () => {
        if ( status === 'OPEN' && !hasBid )
        {
            return <PrimaryButton className={ 'btn-lg' } onClick={ openPlaceBid }>Place Bid</PrimaryButton>;
        } else if ( status === 'OPEN' && hasBid )
        {
            return (
                <div className={ 'button-bar' }>
                    <PrimaryButton color={ 'grey' } onClick={ openPlaceBid }>Edit Bid</PrimaryButton>
                    <PrimaryButton color={ 'grey' } onClick={ handleCancelBid }>Cancel Bid</PrimaryButton>
                </div>
            );
        } else if ( status === 'WON' )
        {
            return <PrimaryButton className={ 'btn-lg' } color={ 'grey' }>Go To Full Order Page</PrimaryButton>;
        }
        return null;
    };

    const getBottomText = () => {
        if ( status === 'OPEN' ) {
            return ( <BidNotes /> );
        }
        else if ( status === 'WON' ) {
            return (
                <>
                    <Typography variant={ 'subtitle2' }>What is a “Won Bid”?</Typography>
                    <Row padding={ '5px 0' }>
                        Cov.Care has reviewed your bid, and approved it. This means you beat out your competitors in either price or turnaround time.
                    </Row>
                </>
            );
        }
        else if ( status === 'LOST' )
        {
            return (
                <>
                    <Typography variant={ 'subtitle2' }> What is a “Lost Bid”? </Typography>
                    <Row padding={ '5px 0' }>
                        Cov.Care has reviewed your order and found that your bid was too high, or that your projected turnaround was too high compared to your competitors.
                    </Row>
                </>
            );
        }
        return null;
    };

    const getTitle = () => {
        if ( status === 'WON' )
        {
            return 'Won Bid';
        }
        else if ( status === 'LOST' )
        {
            return 'Lost Bid';
        }
        return 'Open Order';
    };

    return (
        <Layout title={ getTitle() +' Details' } background={ '#fff' }>
            <Flex backgroundColor={ '#424242' } w={ '100%' } padding={ '24px 0' }>
                { isLoading  ? (
                    <InlineLoading/>
                ) : (
                    <Container>
                        <Row align={ 'start' } style={ { color: '#FFF' } }>
                            <InlineFlex w={ 300 } align={ 'center' } padding={ '0 14px' }>
                                <IconButton onClick={ handleBack }>
                                    <Icon style={ { color: '#FFF' } }>
                                        arrow_back
                                    </Icon>
                                </IconButton>
                                <Col>
                                    <Typography variant={ 'h5' }>{ getTitle() }</Typography>
                                    <Typography variant={ 'body1' }>Order Number: # { item?.order_id }</Typography>
                                </Col>
                            </InlineFlex>
                        </Row>
                    </Container>
                ) }
            </Flex>
            <Container style={ { padding: '30px 0' } }>
                { isLoading  ? (
                    <InlineLoading/>
                ) : (
                    <>
                        <Row>
                            <Col sm={ 5 }>
                                <ProductImage className={ 'product-image' }>
                                    <div className={ 'product-status' }>
                                        { status === 'OPEN' ?
                                            item?.bid_close_at ? (
                                                <BiddingTimeLeft
                                                endDate={ item?.bid_close_at ?? '' }
                                                currentTime={ item?.current_time ?? '' } />
                                            ) : null :
                                            status  === 'WON' ?
                                                <BidWonMarker /> :
                                                status  === 'LOST' ? <BidLostMarker /> : <BidClosedMarker />
                                        }
                                    </div>
                                    <LazyImage
                                        width={ isDesktop ? 430 : isTab ? 350 : 300 }
                                        height={ isDesktop ? 410 : isTab ? 320 : 250 }
                                        src={ item?.sku?.preview_photo }
                                        thumbnail
                                        noMessage
                                        borderRadius={ 5 }
                                        backgroundColor={ '#ccc' }/>
                                </ProductImage>
                            </Col>
                            <Col sm={ 7 } layout={ 'column' }>
                                <Typography variant={ 'subtitle2' }> { item?.sku?.name } </Typography>
                                <Typography variant={ 'caption' }> { item?.brand?.name } </Typography>
                                <ActionButtons>
                                    { getActionButtons() }
                                </ActionButtons>
                                <InlineFlex padding={ '10px 0' } layout={ 'column' }>
                                    <TextLine title={ 'Quantity: ' } content={ item?.quantity }/>
                                    <TextLine title={ 'Your Bid: ' } content={ item?.bid_details && !!(item?.bid_details?.price) ? `$${ item?.bid_details.price }/Unit ($${ parseFloat(item?.bid_details.price) * item?.quantity } total)` : '-' } />
                                    <TextLine title={ 'Projected Turnaround: ' } content={ item?.bid_details && !!(item?.bid_details?.price) ? `${ item?.bid_details.turnaround } Days` : '-' }/>
                                    <TextLine title={ 'Status: ' } content={ status }/>
                                </InlineFlex>
                                <InlineFlex padding={ '10px 0' } layout={ 'column' }>
                                    <TextLine title={ 'Order Number: ' } content={ item?.order_id }/>
                                    <TextLine title={ 'Date Created: ' } content={ item ? formatDate( 'human', item?.bid_start_at ? item?.bid_start_at : '') : null }/>
                                    <TextLine title={ 'Bidding Closes: ' } content={ item ? formatDate( 'human', item?.bid_close_at ? item?.bid_close_at : '') : null }/>
                                </InlineFlex>

                                <InlineFlex padding={ '10px 0' } layout={ 'column' }>
                                    <Typography variant={ 'body2' }>Shipping Address:</Typography>
                                    <Typography variant={ 'body1' }>{ item?.name }</Typography>
                                    <Typography variant={ 'body1' }>{ item?.location?.address_1 }</Typography>
                                    <Typography variant={ 'body1' }>{ item?.location?.city }{ item?.location?.city && (item?.location?.state || item?.location?.state) ? ', ' : '' }{ item?.location?.state } { item?.location?.zip }</Typography>
                                    <Typography variant={ 'body1' }>{ item?.location?.country_name }</Typography>
                                    <Typography variant={ 'body1' }>Email: { item?.user?.email }</Typography>
                                    <Typography variant={ 'body1' }>Phone: { item?.user?.phone }</Typography>
                                </InlineFlex>
                            </Col>
                        </Row>
                        <Row layout={ 'column' } padding={ '20px 0 0 0' }>
                            <Col md={ 5 }>
                                { getBottomText() }
                            </Col>
                        </Row>
                    </>
                ) }
            </Container>
            <PlaceBidDialog onSubmit={ openBidPlaced } apiRef={ dialogs.placeBid } item={ item }/>
            <BidPlacedDialog apiRef={ dialogs.bidPlaced }/>

        </Layout>
    );
}, {
    displayName: 'OpenOrderView'
});

export default OpenOrderView;

