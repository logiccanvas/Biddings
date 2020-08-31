import React                          from 'react';
import { ListContainer }              from '../style';
import { BiddingOrdersTable }         from './components/BiddingOrdersTable';
import { CRUDConfig }                 from '../Interfaces';

function OpenOrders () {

    const prepareIndexConfig = ( config: CRUDConfig ) => {
        config.params = config.params || {};
        config.url = 'medical-bids';

        config.params.is_medical = true;
        config.params.return_only = [
            'id', 'quantity', 'factory_id', 'bid_start_at', 'bid_close_at', 'bid_details', 'is_bid_closed', [ 'sku', [ 'name', 'preview_photo' ] ], [ 'brand', [ 'name' ] ], [ 'location', [ 'name', 'full_address' ] ]
        ];

        return config;
    };

    return (
        <ListContainer>
            <BiddingOrdersTable
                pageTitle={ 'Open Orders' }
                pageType="OPEN"
                prepareIndexConfig={ prepareIndexConfig } />
        </ListContainer>
    );
}

export default OpenOrders;
