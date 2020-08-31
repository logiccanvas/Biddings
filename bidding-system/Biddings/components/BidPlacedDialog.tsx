import React                            from 'react';
import { createMemo }                   from '@packages/react';
import {
    createDialog,
    DialogActions,
    DialogContent,
    DialogHeader
}                                           from '@packages/dialog/index';
import { Row }                              from '@components/Layout/Row';
import { PrimaryButton }                    from '@components/Buttons';
import Typography                           from '@material-ui/core/Typography';

const Content = createMemo<any>(( {
    api,
} ) => {

    return (
        <>
            <DialogHeader>
                <Typography variant="subtitle2">{ 'Bid Placed' }</Typography>
            </DialogHeader>
            <DialogContent>
                <Row>
                    <Typography variant="body1">{ 'Your bid has been successfully placed. You can edit or cancel your bid until bidding closes. Once bidding closes, you will be notified if you won or lost the order.' }</Typography>
                </Row>
            </DialogContent>
            <DialogActions>
                <PrimaryButton onClick={ api.cancel }>Close</PrimaryButton>
            </DialogActions>
        </>
    );
}, {
    displayName: 'BidPlacedContent'
});

export const BidPlacedDialog = createDialog({
    width:     '100%',
    maxWidth:  425,
    dataProps: [ ],
    scroll:    'paper',
    noToggle:  true,
})(Content);
