/**
 * @flow
 */

import { EventEmitter } from 'events';

const BATCH_DURATION = 100;

export default class Bridge extends EventEmitter {
    constructor(wall) {
        super();
        this.wall = wall;
        this.setMaxListeners(Infinity);
        wall.listen(messages => {
            if(Array.isArray(messages)) {
                messages.forEach(message => {
                    this._emit(message);
                });
            }else{
                this._emit(messages);
            }
        });
        this._time = null;
        this._sendingQueue = [];
        this._receivingQueue = [];
        this._batchingQueue = [];
        this._sending = false;
    }

    log(message) {
        this.send('log', message);
    }

    send(event, payload) {
        if(Array.isArray(payload)) {
            let lastIndex = payload.length - 1;
            payload.forEach((_chunk, index) => {
                this._send({
                    event,
                    _chunk,
                    last: index === lastIndex
                });
            });
            this._flush();
        }else if(this._time === null) {
            this._send([{ event, payload }]);
            this._time = Date.now();
        }else{
            this._batchingQueue.push({
                event,
                payload
            });

            let now = Date.now();
            if(now - this._time > BATCH_DURATION) {
                this._flush();
            }else{
                this._timer = setTimeout(() => this._flush(), BATCH_DURATION);
            }
        }
    }

    _send(messages) {
        this._sendingQueue.push(messages);
        this._nextSend();
    }

    _emit(message) {
        if(typeof message === 'string') {
            this.emit(message);
        }else if(message._chunk) {
            this._receivingQueue.push(message._chunk);
            if(message.last) {
                this.emit(this.message.event, this._receivingQueue);
                this._receivingQueue = [];
            }
        }else{
            this.emit(message.event, message.payload);
        }
    }

    _flush() {
        if(this._batchingQueue.length) this._send(this._batchingQueue);
        clearTimeout(this._timer);
        this._batchingQueue = [];
        this._time = null;
    }

    _nextSend() {
        if(!this._sendingQueue.length || this._sending) return;
        this._sending = true;
        const messages = this._sendingQueue.shift();
        try {
            this.wall.send(messages);
        } catch (error) {
            if(error.messages === 'Message length exceeded maximum allowed length.') {
                this._sendingQueue.splice(0, 0, messages.map(message => [message]));
            }
        }
        this._sending = false;
        requestAnimationFrame(() => this._nextSend());
    }
}