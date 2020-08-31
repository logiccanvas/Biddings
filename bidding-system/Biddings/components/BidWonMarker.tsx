import React                          from 'react';
import styled                         from 'styled-components';
import { createMemo }                 from '@packages/react';
import Box                            from '@material-ui/core/Box';
import Typography                            from '@material-ui/core/Typography';

export const BidWonMarker = createMemo<any>(() => {

    return (
        <BidWonBox>
            <Typography>WON</Typography>
        </BidWonBox>
    );
}, {
    displayName: 'BidWonMarker'
});

const BidWonBox = styled(Box)`
    && {
        padding: 4px 12px;
        background-color: #00AFEF;
        color: white;
    }
`;
