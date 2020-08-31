import React                              from 'react';
import Typography                         from '@material-ui/core/Typography';
import { Ol }                             from '../style';

export const BidNotes = () => {
    return (
        <>
            <Typography variant={ 'subtitle2' }>How to Bid</Typography>
            <Ol>
                <li>Click "Place Bid".</li>
                <li>Enter the bid amount per unit in USD and your projected turnaround time.</li>
                <li>Click "Submit Bid".</li>
            </Ol>
            <p>Once bidding closes, you will be notified if your bid on the order has won or lost. If you won the order, it will populate your “Bids Won” and “Orders” list and you will be responsible for filling that order.</p>
        </>
    );
};