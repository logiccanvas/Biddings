import React               from 'react';
import { pageModule } from '@components/pageModule';
import { AsyncPageRender }         from '@components/AsyncComponent';
import { ProtectedRoute }          from '@components/Layout/ProtectedRoute';
import { Route }                   from '@packages/router';

export const routes$ = {
    // ClosedOrders
    OpenOrders: AsyncPageRender(() => pageModule(import('./list/OpenOrders'))),
    OpenBids:   AsyncPageRender(() => pageModule(import('./list/OpenBids'))),
    ClosedBids: AsyncPageRender(() => pageModule(import('./list/ClosedBids'))),
    BidsWon:    AsyncPageRender(() => pageModule(import('./list/BidsWon'))),
    BidsLost:   AsyncPageRender(() => pageModule(import('./list/BidsLost'))),
    View:       AsyncPageRender(() => pageModule(import('./view/View'))),
    ViewWon:    AsyncPageRender(() => pageModule(import('./view/Won'))),
    ViewLost:   AsyncPageRender(() => pageModule(import('./view/Lost'))),
};

export default () => (
    <>
        <Route name={ 'Bidding.Order.OpenOrders' } exact path={ '/bidding-order/OpenOrders' } component={ ProtectedRoute(routes$.OpenOrders) }/>
        <Route name={ 'Bidding.Order.OpenBids' } exact path={ '/bidding-order/open' } component={ ProtectedRoute(routes$.OpenBids) }/>
        <Route name={ 'Bidding.Order.ClosedBids' } exact path={ '/bidding-order/closed' } component={ ProtectedRoute(routes$.ClosedBids) }/>
        <Route name={ 'Bidding.Order.BidsWon' } exact path={ '/bidding-order/won' } component={ ProtectedRoute(routes$.BidsWon) }/>
        <Route name={ 'Bidding.Order.BidsLost' } exact path={ '/bidding-order/lost' } component={ ProtectedRoute(routes$.BidsLost) }/>
        <Route name={ 'Bidding.Order.View' } exact path={ '/bidding-order/:id/view' } component={ ProtectedRoute(routes$.View) }/>
        <Route name={ 'Bidding.Order.ViewWon' } exact path={ '/bidding-order/:id/view/won' } component={ ProtectedRoute(routes$.ViewWon) }/>
        <Route name={ 'Bidding.Order.ViewLost' } exact path={ '/bidding-order/:id/view/lost' } component={ ProtectedRoute(routes$.ViewLost) }/>
    </>
);
