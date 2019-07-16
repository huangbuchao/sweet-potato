import { disptchThunkify } from '../utils';
import { ACTION_SET_POSITION } from './actionTypes';

const actions = {
    setPosition(payload) {
        return {
            type: ACTION_SET_POSITION,
            payload: payload
        }
    }
};

export default actions;