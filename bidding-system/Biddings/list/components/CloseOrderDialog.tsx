import React                                    from 'react';
import { createMemo }                           from '@packages/react';
import {
    createDialog,
    DialogApi,
    DialogContent,
    DialogActions }                             from '@packages/dialog/createDialog';
import { PrimaryButton }                        from '@components/Buttons';
import styled                                   from 'styled-components';
import { call }                                 from '@packages/functions';
import { DialogCompleteHeader }                 from '@packages/dialog/DialogCompleteHeader';
import Typography                               from '@material-ui/core/Typography';

interface CloseOrderDialogProps {
    onClose: any;
    selected?: any[];
}

export const Content = createMemo<CloseOrderDialogProps & { api: DialogApi }>(( {
    api,
    selected = [],
    onClose
} ) => {

    const orderText = selected.length > 1 ? 'orders' : 'order';
    const thisText = selected.length > 1 ? 'these' : 'this';

    const title = ( selected.length > 1 ) ? 'Close ' + selected.length + ' Orders' : 'Close Order';

    const renderItems = () => {
        return (
            <div style={ { marginBottom: 20 } }>
                { selected.map((item, index) => <Typography key={ `${ item.id }-${ index }` } variant={ 'body2' }>{ item.sku.name }</Typography> ) }
            </div>
        );
    };

    const handleClose = async ( value ) => {
        call(onClose, value);
        api.close();
    };

    return (
        <ContentWrapper>
            <DialogCompleteHeader headline={ title }/>
            <DialogContent>
                <Typography variant={ 'body1' } className="para">Are you sure you want to close the open { orderText } for:</Typography>

                { renderItems() }

                <Typography variant={ 'body1' } className="para">Biding on { thisText } { orderText } will be closed, all bids will be lost and { thisText } open { orderText } will be moved to Closed Orders tab.</Typography>

                <DialogActions>
                    <PrimaryButton
                        variant={ 'outlined' }
                        onClick={ () => handleClose('cancel') }>
                        Cancel
                    </PrimaryButton>
                    <PrimaryButton
                        onClick={ () => handleClose('close') }>
                        Close Order
                    </PrimaryButton>
                </DialogActions>

            </DialogContent>
            {/* <DialogLoading loading={ }/> */}
        </ContentWrapper>
    );
}, {
    displayName: 'CloseOrderDialogContent'
});

export const CloseOrderDialog = createDialog<CloseOrderDialogProps>({
    width:     'calc(100% - 30px)',
    maxWidth:  500,
    dataProps: [ 'onClose', 'selected' ],
    noToggle:  true
})(Content);

const ContentWrapper = styled.div`
    && {

        .MuiDialogTitle-root {
            padding-bottom: 0;
        }
        .MuiDivider-root {
            display: none;
        }
        .MuiDialogContent-root {
            padding: 16px 18px;
        }
        .MuiDialogActions-root {
            padding: 0;
        }

        .para {
            color: 'rgba(0,0,0,0.55';
            margin-bottom: 20px;
        }

    }
`;