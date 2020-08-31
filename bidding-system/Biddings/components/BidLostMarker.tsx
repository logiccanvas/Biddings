import React                          from 'react';
import styled                         from 'styled-components';
import { createMemo }                 from '@packages/react';
import Box                            from '@material-ui/core/Box';
import Typography                            from '@material-ui/core/Typography';

export const BidLostMarker = createMemo<any>(() => {

    return (
        <BidLostBox>
            <Typography>LOST</Typography>
        </BidLostBox>
    );
}, {
    displayName: 'BidLostMarker'
});

const BidLostBox = styled(Box)`
    && {
        padding: 4px 21px;
        background-color: #E53935;
        color: white;
    }
`;
