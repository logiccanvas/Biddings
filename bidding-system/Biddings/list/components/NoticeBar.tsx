import React, { useState }              from 'react';
import { createMemo }                   from '@packages/react';
import { CompactButton }                from '@components/Buttons';
import IconButton                       from '@material-ui/core/IconButton';
import KeyboardArrowDownIcon            from '@material-ui/icons/KeyboardArrowDown';
import InfoIcon                         from '@material-ui/icons/Info';
import { BidNotes }                     from '../../components/BidNotes';

export const NoticeBar = createMemo(() => {

    const [ infoBox, setInfoBox ]                   = useState(false);

    const toggleInfoBox = () => {
        setInfoBox( !infoBox );
    };

    return (
        <div className="notice-bar">
            { infoBox ? (
                <div className="info-box">
                    <CompactButton className="info-box-head" onClick={ toggleInfoBox }>
                        <KeyboardArrowDownIcon />
                    </CompactButton>
                    <div className="info-box-text">
                        <BidNotes />
                    </div>
                </div>
            )
                : (
                    <IconButton className={ 'info-cta' } onClick={ toggleInfoBox }>
                        <InfoIcon />
                    </IconButton>
                )}
        </div>
    );
}, { displayName: 'NoticeBar' });
