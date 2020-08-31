import React, { useCallback, useState, useEffect, useRef } from 'react';
import { createMemo }                                      from '@packages/react';
import { api }                                             from '@lib/http';
import Select                                              from '@material-ui/core/Select';
import Icon                                                from '@material-ui/core/Icon/Icon';
import IconButton                                          from '@material-ui/core/IconButton/IconButton';
import MenuItem                                            from '@material-ui/core/MenuItem';
import Button                                              from '@material-ui/core/Button/Button';
import { PrimaryButton }                                   from '@components/Buttons';
import FormControl                                         from '@material-ui/core/FormControl';
import InputLabel                                          from '@material-ui/core/InputLabel';
import ListItemText                                        from '@material-ui/core/ListItemText';
import Checkbox                                            from '@material-ui/core/Checkbox';
import { Textfield }                                       from '@components/Form/fields/Textfield';
import { Form, Formik, FormikProps }                       from 'formik';
import moment                                              from 'moment';
import { classNames }                                      from '@lib/utils';
import { DateRangeComponent }                              from '@components/DateRangePicker';
import ClickAwayListener                                   from '@material-ui/core/ClickAwayListener';

import { FilterMenu, PriceRangeBox, DateRangeWrapper, StickyField } from '../../style';
import { SupportedPlatforms }                                       from '@woozard/apparel/platform';

interface BiddingFiltersControlProps {
    selectProduct: ( product ) => void;
    selectQuantity: ( quantity ) => void;
    selectDateRange: ( date ) => void;
}

const BiddingFiltersControl = createMemo<BiddingFiltersControlProps>(( {
    selectProduct,
    selectQuantity,
    selectDateRange
} ) => {

    const formRef = useRef<FormikProps<any> | null>(null);

    const [ showFilter, setShowFilter ] = useState<boolean>(false);
    const [ anchorEl, setAnchorEl ] = React.useState(null);

    const [ selectedDate, setSelectedDate ] = useState('');
    const [ quantityRange, setQuantityRange ] = useState('');
    const [ validQauntity, setvalidQauntity ] = useState(false);
    const [ productNames, setProductNames ] = useState<any>([]);
    const [ productIds, setProductIds ] = useState<any>([]);
    const [ openProductList, setOpenProductList ] = React.useState(false);
    const [ skus, setSkus ] = useState<any>([]);
    const [ showDatePicker, setShowDatePicker ] = useState(false);

    const [ activateFilters, setActivateFilters ] = useState(false);

    const params: any = {
        fields:          [ 'id', 'name' ],
        order_direction: 'asc',
        order_by:        'name',
        tags:            [ SupportedPlatforms.COVCARE_VENDOR, SupportedPlatforms.COVCARE_MARKETPLACE ],
        filter_by_extra: true,
        all:             true
    };

    const initialValues = {
        by_products:       '',
        quantity_from:     0,
        quantity_to:       0,
        by_date_range:     '',
        by_quantity_range: ''
    };

    const loadSku = async () => {
        const { data } = await api.get('apparel-skus', { params });
        setSkus(data.items);
    };

    useEffect(() => {
        loadSku();
    }, []);

    const emitSelection = useCallback(( { target } ) => {
        if ( target.value === -1 ) {
            return;
        }

        if ( target.name === 'by_products_range' ) {
            selectProduct(target.value);
        }

        if ( target.name === 'by_quantity_range' ) {
            selectQuantity(target.value);
        }

        if ( target.name === 'by_date_range' ) {
            selectDateRange(target.value);
        }

    }, [ selectProduct, selectQuantity, selectDateRange ]);

    const handleSubmit = () => {
        console.log('');
    };

    const handleSelect = ( { target } ) => {
        const products = compareProductNames(skus, target.value);
        setProductNames(target.value);
        setProductIds(products);
    };

    const handleCloseProductList = () => {
        setOpenProductList(!openProductList);
    };

    const triggerProductSelect = () => {
        const range = { target: { value: productIds, name: 'by_products_range' } };
        emitSelection(range);
        handleCloseProductList();
    };

    const compareProductNames = ( arr1, arr2 ) => {
        const products: any = [];

        arr1.forEach(( e1 ) => arr2.forEach(( e2 ) => {
            if ( e1.name === e2 ) {
                products.push(e1.id);
            }
        }));

        return products;
    };

    const handldRenderValue = ( selected ) => selected.join(', ');

    const handleShowFilter = ( event: any ) => {
        setAnchorEl(event.currentTarget);
        setShowFilter(true);
    };

    const handleCloseFilter = () => {
        setAnchorEl(null);
        setShowFilter(false);
    };

    const selectQuantityRange = ( from, to, reset? ) => {
        let makeRange = from + ' - ' + to;

        if ( reset ) {
            from = 0;
            to = 0;
            makeRange = '';

            formRef.current?.setFieldValue('quantity_from', 0);
            formRef.current?.setFieldValue('quantity_to', 0);
        }

        let range: any = {};

        formRef.current?.setFieldValue('by_quantity_range', makeRange);
        range = {
            target: { value: { from, to }, name: 'by_quantity_range' }
        };

        ( reset ) && ( range.target.value.reset = 'reset' );

        setQuantityRange(makeRange);
        emitSelection(range);

        handleCloseFilter();
    };

    const handleQuantity = ( { target } ) => {
        let from = target.name === 'quantity_from' ? target.value : formRef.current?.values.quantity_from;
        let to = target.name === 'quantity_to' ? target.value : formRef.current?.values.quantity_to;
        from = Number(from);
        to = Number(to);

        if ( ( from < 1 || to < 1 ) || to < from ) {
            setvalidQauntity(false);
        } else {
            setvalidQauntity(true);
        }
    };

    const handleShowPicker = () => {
        setShowDatePicker(!showDatePicker);
    };

    const handleHidePicker = () => {
        setShowDatePicker(false);
    };

    const handleDateRange = ( event ) => {
        const startDate = moment(event.startDate).format('MM/DD/YYYY');
        const endDate = moment(event.endDate).format('MM/DD/YYYY');

        const from = moment(event.startDate).format('YYYY-MM-DD');
        const to = moment(event.endDate).format('YYYY-MM-DD');

        const selectDate = startDate + ' - ' + endDate;

        setSelectedDate(selectDate);

        const range = {
            target: { value: { from, to }, name: 'by_date_range' }
        };
        emitSelection(range);
        handleShowPicker();
    };

    return (
        <Formik
            enableReinitialize
            initialValues={ initialValues }
            onSubmit={ handleSubmit }>{ ( form ) => {
                formRef.current = form;
                return (
                    <>
                        <IconButton
                        className={ 'control-toggle-button' }
                        onClick={ () => setActivateFilters(!activateFilters) }>
                            <Icon>filter_list</Icon>
                        </IconButton>

                        <Form className={ classNames('table-control-bar-form', { 'active': activateFilters }) }>
                            <FormControl variant="outlined" className="select-box">
                                <InputLabel id="product-select-label">Select Products</InputLabel>
                                <Select
                                name={ 'by_products' }
                                multiple
                                value={ productNames }
                                open={ openProductList }
                                onClose={ handleCloseProductList }
                                onOpen={ handleCloseProductList }
                                renderValue={ handldRenderValue }
                                onChange={ handleSelect }>
                                    { skus.length && ( skus.map(( sku ) => (
                                        <MenuItem key={ sku.id } value={ sku.name }>
                                            <Checkbox checked={ productNames.indexOf(sku.name) > -1 }/>
                                            <ListItemText primary={ sku.name }/>
                                        </MenuItem>
                                    )) ) }
                                    <StickyField key={ 'products-sticky-field' }>
                                        <PrimaryButton
                                        disabled={ !productNames.length }
                                        onClick={ triggerProductSelect }>
                                        Apply
                                        </PrimaryButton>
                                    </StickyField>
                                </Select>
                            </FormControl>

                            <Button
                            className="form-group-button"
                            onClick={ handleShowFilter }
                            variant={ 'outlined' }>
                                { quantityRange ? 'Quantity ' + quantityRange : 'Quantity Range' }
                            </Button>

                            <FilterMenu
                            open={ showFilter }
                            keepMounted={ true }
                            onClose={ handleCloseFilter }
                            anchorEl={ anchorEl }>

                                <PriceRangeBox>
                                    <div className="input-row">
                                        <div className="form-group">
                                            <Textfield
                                            className="form-control"
                                            type="number"
                                            label="From"
                                            name={ 'quantity_from' }
                                            onChange={ ( event ) => handleQuantity(event) }
                                            placeholder="Enter min"/>
                                        </div>
                                        <div className="input-to">to</div>
                                        <div className="form-group">
                                            <Textfield
                                            className="form-control"
                                            type="number"
                                            label="To"
                                            name={ 'quantity_to' }
                                            onChange={ ( event ) => handleQuantity(event) }
                                            placeholder="Enter max"/>
                                        </div>
                                    </div>
                                    <div className="button-bar">
                                        <PrimaryButton
                                        color={ 'grey' }
                                        onClick={ () => selectQuantityRange(form.values.quantity_from, form.values.quantity_to, 'reset') }>
                                        Reset
                                        </PrimaryButton>
                                        <PrimaryButton
                                        disabled={ !validQauntity }
                                        onClick={ () => selectQuantityRange(form.values.quantity_from, form.values.quantity_to) }>
                                        Apply
                                        </PrimaryButton>
                                    </div>
                                </PriceRangeBox>
                            </FilterMenu>

                            <ClickAwayListener onClickAway={ handleHidePicker }>
                                <DateRangeWrapper>
                                    <Button
                                    className="form-group-button"
                                    onClick={ handleShowPicker }
                                    variant={ 'outlined' }>
                                        { selectedDate === '' ? 'Date Range' : selectedDate }
                                    </Button>
                                    { showDatePicker ? <div className="date-picker-component"><DateRangeComponent onClick={ handleDateRange }/></div> : null }
                                </DateRangeWrapper>
                            </ClickAwayListener>

                        </Form>
                    </>
                );
            } }
        </Formik>
    );
}, { displayName: 'BiddingFiltersControl' });

export default BiddingFiltersControl;
