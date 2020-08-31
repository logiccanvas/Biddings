import React                            from 'react';
import { BiddingOrdersTable }           from './components/BiddingOrdersTable';
import { CRUDConfig }                   from '../Interfaces';
import { BiddingsProvider }             from '../context';

import { ListContainer }                from '../style';
import { FIELDS }                       from './fields';

function OpenOrders () {

    const prepareIndexConfig = ( config: CRUDConfig ) => {
        config.params = config.params || {};
        config.url = 'medical-bids';

        config.params.is_medical = true;
        config.params.is_open_order = false;
        config.params.bids_win = true;

        config.params.return_only = FIELDS;

        return config;
    };

    return (
        <ListContainer>
            <BiddingsProvider value={ { items: [] } }>
                <BiddingOrdersTable
                    pageTitle={ 'Bids Won' }
                    pageType="WON"
                    prepareIndexConfig={ prepareIndexConfig } />
            </BiddingsProvider>
        </ListContainer>
    );
}

export default OpenOrders;
