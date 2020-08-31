import React, {
    useCallback,
    useMemo,
    useState,
    useEffect }                         from 'react';
import { createMemo }                   from '@packages/react';
import {
    createDialog,
    DialogActions,
    DialogContent,
    DialogLoading
}                                           from '@packages/dialog/index';
import { DialogCompleteHeader }             from '@packages/dialog/DialogCompleteHeader';
import { Row }                              from '@components/Layout/Row';
import { PrimaryButton, CompactButton }     from '@components/Buttons';
import { Textfield }                        from '@components/Form/fields/Textfield';
import { Form, Formik }                     from 'formik';
import { useNotify }                        from '@hooks/useNotify';
import { call }                             from '@packages/functions';
import InputAdornment                       from '@material-ui/core/InputAdornment';
import AttachMoney                          from '@material-ui/icons/AttachMoney';
import Typography                           from '@material-ui/core/Typography';
import { Col }                              from '@components/Layout/Col';
import { LazyImage }                        from '@packages/image/LazyImage';
import { api as placeBidApi }               from '@lib/http';
import Box                                  from '@material-ui/core/Box';
import Divider                              from '@material-ui/core/Divider';
import { InlineFlex }                       from '@components/Layout/Blocks';
import { useUser }                          from '@hooks/useUser';
import * as Yup         from 'yup';

const Content = createMemo<any>(( {
    api,
    item = {
        brand:       null,
        id:          null,
        quantity:    null,
        sku:         null,
        vendor:      null,
        bid_details: {
            price:      null,
            turnaround: null
        },
    },
    editBlock = '',
    onSubmit
} ) => {

    const user = useUser();
    const notify = useNotify();
    const [ price, setPrice ] = useState(parseFloat(item?.bid_details?.price ?? 0));
    const [ bidTotal, setBidTotal ] = useState(0);

    const initialValues = {
        price:      price,
        turnaround: item?.bid_details?.turnaround ?? 0,
    };

    useEffect(() => {
        if ( editBlock ) {
            const dialogWrap = document.querySelector('.MuiDialog-paperScrollPaper');
            const element: any = document.querySelector(`.block-${ editBlock }`);
            const pos = element?.getBoundingClientRect().top | 0;

            dialogWrap?.scrollTo({
                top:      pos - 50,
                behavior: 'smooth'
            });
        }
    }, [ editBlock ]);

    const handleSubmit = useCallback(async ( { price, turnaround } ) => {
        try {

            if ( price <= 0 || turnaround <= 0)
            {
                notify.error('All values must be greater than 0!');
            }

            else
            {

                let data$: any = null;

                data$ = await placeBidApi.put(`medical-bids/${ item.id }`,
                    {
                        item_id:    item.id,
                        factory_id: user.factory_id,
                        price,
                        turnaround,
                        bid_total:  bidTotal
                    }
                );

                const return_data = {
                    result: data$.data,
                    price,
                    turnaround
                };

                call(onSubmit, return_data);
                api.cancel();
            }
        } catch ( e ) {
            notify.error(e);
        }

    }, [ bidTotal ]);

    const handleChangePrice = ( e ) => {
        setPrice(e.target.value);
    };

    useEffect( () => {
        const customer_price = Number(price ?? 0);
        const quantity = Number(item.quantity ?? 0);

        setBidTotal( Number((customer_price * quantity).toFixed(2)) );
    }, [ price ]);

    const startAdornment = useMemo(() => (
        <InputAdornment position={ 'start' }>
            <AttachMoney/>
        </InputAdornment>
    ), []);

    return (
        <>
            <DialogCompleteHeader headline={ item?.bid_details?.turnaround ? 'Edit Bid' : 'Place Bid' }/>
            <Formik initialValues={ initialValues as any } onSubmit={ handleSubmit } validationSchema={ Yup.object().shape({
                price:      Yup.number().moreThan(0, 'Value must be greater than 0').required('Price is required'),
                turnaround: Yup.number().moreThan(0, 'Value must be greater than 0').required('Turnaround is required'),
            }) } validateOnMount validateOnChange>{ ( form ) => (
                    <Form>
                        <DialogContent>
                            <Row padding={ '0 0 20px 0' }>
                                <Col md={ 2 }>
                                    <LazyImage width={ 80 } height={ 80 } src={ item?.sku?.preview_photo?.file_path } thumbnail noMessage borderRadius={ 5 } backgroundColor={ '#ccc' }/>
                                </Col>
                                <Col padding={ '0 10px' } md={ 10 } layout={ 'column' }>
                                    <Row>
                                        <InlineFlex>
                                            <Typography variant="subtitle2">{ item?.sku?.name }</Typography>
                                            <Box ml={ 1 }>
                                                <Typography variant="body1">x { item?.quantity } Units</Typography>
                                            </Box>
                                        </InlineFlex>
                                    </Row>
                                    <Typography variant="body1">{ item?.brand?.name }</Typography>
                                    <Typography variant="caption" color={ 'textSecondary' }>Enter your bid price per unit and projected turnaround time before</Typography>

                                </Col>

                            </Row>
                            <Divider/>
                            <Box padding={ '10px 0' }>
                                <Row align={ 'center' } >
                                    <Col md>
                                        <Typography
                                            variant={ 'body2' }
                                            gutterBottom={ false }>

                                            Price per Unit (in USD)
                                        </Typography>
                                    </Col>
                                    <Col md>
                                        <Textfield
                                            name={ 'price' }
                                            type="number"
                                            InputProps={ { startAdornment, inputProps: { style: { textAlign: 'end' } } } }
                                            onChange={ handleChangePrice }/>
                                    </Col>
                                </Row>
                                <Row align={ 'center' }>
                                    <Col md>
                                        <Typography
                                            variant={ 'body2' }
                                            gutterBottom={ false }>

                                            Projected Turnaround
                                        </Typography>
                                    </Col>
                                    <Col md>
                                        <Textfield
                                            name={ 'turnaround' }
                                            type="number"
                                            InputProps={ { endAdornment: ( <InputAdornment position="end">Days</InputAdornment> ) } }/>
                                    </Col>
                                </Row>
                            </Box>
                            <Divider/>
                            <Box
                                color={ 'textSecondary' }
                                padding={ '20px 0' }>
                                <Row>
                                    <Col md>
                                        <Typography variant="body2" className={ 'label' }>Bid Total:</Typography>
                                        <Typography variant="body1">${ bidTotal }</Typography>
                                    </Col>
                                </Row>
                            </Box>
                        </DialogContent>
                        <Divider/>
                        <DialogActions>
                            <CompactButton onClick={ api.cancel }>Cancel</CompactButton>
                            <PrimaryButton type={ 'submit' } loading={ form.isSubmitting } disabled={ form.isSubmitting || !form.isValid }>{ item?.bid_details?.turnaround ? 'Edit Bid' : 'Submit Bid'} </PrimaryButton>
                        </DialogActions>
                        <DialogLoading loading={ form.isSubmitting }/>
                    </Form>
                ) }</Formik>
        </>
    );
}, {
    displayName: 'PlaceBidContent'
});

export const PlaceBidDialog = createDialog({
    width:                '100%',
    maxWidth:             528,
    dataProps:            [ 'item', 'editBlock', 'onSubmit' ],
    scroll:               'paper',
    disableBackdropClick: true,
    noToggle:             true,
})(Content);
