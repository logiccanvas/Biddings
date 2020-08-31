import { createActions, createContext, stateSetter } from '@packages/context';
import { ContextType }        from '@packages/context/lib/createContext';
import { Record }                                 from 'immutable';

interface BiddingOrdersStateType {
    items: any[];
    pagination: any[];
    loading: boolean;
}

const BiddingOrdersState = Record<BiddingOrdersStateType>({
    items:      [],
    pagination: [],
    loading:    true
});

type ActionsType =
    'setItems'  |
    'setPagination' |
    'setLoading'
;

const actions = createActions<ActionsType>([
    'setItems',
    'setPagination',
    'setLoading'
]);

export type OrderFormAPI = ContextType<BiddingOrdersStateType, typeof actions>;

export const { Provider, Context } = createContext<BiddingOrdersStateType, typeof actions>({
    actions,
    initialState: BiddingOrdersState,
    name:         'Biddings',
    debug:        false,
    events:       {
        onSetItems:      stateSetter('items'),
        onSetPagination: stateSetter('pagination'),
        onSetLoading:    stateSetter('loading')
    }
});

export const BiddingsProvider = Provider;
export const BiddingsContext = Context;
