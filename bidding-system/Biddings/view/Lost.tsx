import React, { useState, useEffect }                  from 'react';
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
import { createMemo }                     from '@packages/react';
import { useParams, useRouter }           from '@hooks/useRouter';
import { api }                            from '@lib/http';
import { formatDate }                     from '@lib/datetime';
import { BidLostMarker }                  from '@containers/Biddings/components/BidLostMarker';
import { route }                          from '@packages/router';
import { useMediaQuery }                  from '@hooks/useMediaQuery';
import { ProductImage }                   from '../style';

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

const LostOrderView = createMemo<any>( ( ) => {
    const params = useParams();
    const [ isLoading, setIsloading ] = useState(false);
    const [ item, setItem ] = useState<any>({});
    const { history } = useRouter();

    const isTab = useMediaQuery('(min-width: 768px)');
    const isDesktop = useMediaQuery('(min-width: 1200px)');

    useEffect( () => {
        loadItem();
    }, []);

    const loadItem = async () => {
        setIsloading(true);
        const { data } = await api.get('medical-bids', {
            params: {
                item_id:       params.id,
                is_open_order: false,
                return_only:   'id,location,sku{name,preview_photo},brand{name},quantity,created_at,bid_start_at,bid_close_at,order_id,factory_id,is_bid_closed,bid_details,user{email,phone}'
            }
        });
        setItem(data.items[ 0 ]);
        setIsloading(false);
    };

    const handleBack = () => {
        history.push(route('Bidding.Order.BidsLost'));
    };

    const getBottomText = () => {
        return (
            <>
                <Typography variant={ 'subtitle2' }> What is a “Lost Bid”? </Typography>
                <Row padding={ '5px 0' }>
                    Cov.Care has reviewed your order and found that your bid was too high, or that your projected turnaround was too high compared to your competitors.
                </Row>
            </>
        );
    };

    const getTitle = () => {
        return 'Lost Bid';
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
                                        <BidLostMarker />
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
                                <InlineFlex padding={ '10px 0' } layout={ 'column' }>
                                    <TextLine title={ 'Quantity: ' } content={ item?.quantity }/>
                                    <TextLine title={ 'Your Bid: ' } content={ item?.bid_details && !!(item?.bid_details?.price) ? `$${ item?.bid_details.price }/Unit ($${ parseFloat(item?.bid_details.price) * item?.quantity } total)` : '-' } />
                                    <TextLine title={ 'Projected Turnaround: ' } content={ item?.bid_details && !!(item?.bid_details?.price) ? `${ item?.bid_details.turnaround } Days` : '-' }/>
                                    <TextLine title={ 'Status: ' } content="LOST"/>
                                </InlineFlex>
                                <InlineFlex padding={ '10px 0' } layout={ 'column' }>
                                    <TextLine title={ 'Order Number: ' } content={ item?.order_id }/>
                                    <TextLine title={ 'Date Created: ' } content={ formatDate( 'human', item?.bid_start_at ? item?.bid_start_at : '') }/>
                                    <TextLine title={ 'Bidding Closes: ' } content={ formatDate( 'human', item?.bid_close_at ? item?.bid_close_at : '') }/>
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

        </Layout>
    );
}, {
    displayName: 'LostOrderView'
});

export default LostOrderView;

