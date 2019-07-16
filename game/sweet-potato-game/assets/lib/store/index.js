import { positionReducer } from '../reducers/positonReducer';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import EventTarget from '../event';
import { inherit } from '../utils';

export function Store (actions) {
    this.actions = {};

    const actionMiddleware = store => next => action => {
        this.emit({ type: 'action', data: store });
        return next(action);
    };

    const actionsWrapperMiddleware = store => next => action => {

    };

    const thunk = store => next => action =>
        typeof action === 'function'
            ? action(store.dispatch, store.getState)
            : next(action)

    const logger = store => next => action => {
        console.group(action.type)
        console.info('dispatching', action)
        let result = next(action)
        console.log('next state', store.getState())
        console.groupEnd()
        return result
    }

    const store = this.store = createStore(
        combineReducers({ positionReducer }),
        applyMiddleware(actionMiddleware, logger, thunk)
    );

    store.subscribe(() => {
        this.emit({ type: 'change', data: store.getState()});
    });

    Object.keys(actions).forEach(key => {
        this.actions[key] = function() {
            let action = actions[key].apply(this, arguments);
            return store.dispatch(action);
        }
    });
}

inherit(Store, EventTarget);