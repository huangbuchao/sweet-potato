import EventTarget from '../lib/event';
import actions from '../lib/actions';
import { Store } from '../lib/store';

cc.Class({
    extends: cc.Component,

    properties: {},

    onLoad() {
        this.nodes = [];
        this.scripts = [];
        this.store = new Store(actions);
        this.event = new EventTarget();

        this.initData();
        this.initActions();
        this.bindStateChange();
    },

    bindStateChange() {
        this.event.on('change', e => {
            this.scripts.forEach(ctx => {
                ctx.onStateChange(e.data);
            });
        });
    },

    initActions() {
        this.scripts.forEach(ctx => {
            ctx.actions = this.store.actions;
        });
    },

    initData() {
        this.getNodes(this.node);
        this.getScripts();
    },

    getNodes(node) {
        for (let index = 0; index < node.children.length; index++) {
            const element = node.children[index];
            this.nodes.push(element);
            if (element.children.length !== 0) {
                this.getNodes(element);
            }
        }
    },

    getScripts() {
        for (let index = 0; index < this.nodes.length; index++) {
            const element = this.nodes[index];
            let components = element.getComponents(cc.Component);
            components = components.filter(com => com.onStateChange);
            Array.prototype.push.apply(this.scripts, components);
        }
    },

    walk(obj, func, target) {
        for (let index = 0; index < node[target].length; index++) {
            const element = node[target][index];
        }
    }
});
