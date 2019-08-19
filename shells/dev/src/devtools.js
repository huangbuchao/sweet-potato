/**
 * @flow
 */

import initDevtools from 'src/frontend';
import Bridge from 'src/bridge';

const target = document.getElementById('target');
const targetWindow = target.contentWindow;

target.src = 'target.html';
target.onload = () => {
    initDevtools({
        connect(cb) {
            inject('./build/backend.js', () => {
                cb(new Bridge({
                    listen(fn) {
                        target.parent.addEventListener('message', ev => fn(ev.data));
                    },
                    send(data) {
                        console.log('devtool->target', data);
                        targetWindow.postMessage(data, '*');
                    }
                }));
            });
        },
        onReload(reloadFunc) {
            target.onload = reloadFunc;
        }
    })
};

function inject(src, done) {
    if(!src || src === 'false') {
        return done();
    }
    const script = target.contentDocument.createElement('script');
    script.src = src;
    script.onload = done;
    target.contentDocument.body.appendChild(script);
}