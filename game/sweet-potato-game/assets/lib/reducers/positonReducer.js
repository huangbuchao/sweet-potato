import clone from 'clone';
import { ACTION_SET_POSITION } from '../actions/actionTypes';

export function positionReducer(state = Array(6).fill(null).map(() => { return { point: null }; }), action) {
    let { type, payload } = action;
    switch (type) {
        case ACTION_SET_POSITION:
            let { index, point } = payload;
            let newState = clone(state);
            newState[index].point = point;
            //Object.assign({}, state, payload);
            return newState;
        default:
            return state;
    }
}

//TODO
