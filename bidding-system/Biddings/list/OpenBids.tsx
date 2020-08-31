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
        config.params.is_open_order = true;
        config.params.is_open_bid = true;
        // config.params.is_closed = false;

        config.params.return_only = FIELDS;

        return config;
    };

    return (
        <ListContainer>
            <BiddingsProvider value={ { items: [] } }>
                <BiddingOrdersTable
                    pageTitle={ 'Open Bids' }
                    pageType="OPEN"
                    prepareIndexConfig={ prepareIndexConfig } />
            </BiddingsProvider>
        </ListContainer>
    );
}

export default OpenOrders;
