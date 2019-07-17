import Hammer from '../lib/CocosHammer';

cc.Class({
    extends: cc.Component,

    properties: {},

    onLoad() {
        this.index = this.node.getSiblingIndex();
        this.initPosition = this.node.getPosition();
        this.listenEvents();
    },

    listenEvents() {
        this.hammer = new Hammer(this.node);
        this.hammer.on('panmove', ({ srcEvent }) => {
            let point = this.node.parent.convertToNodeSpaceAR(
                srcEvent.getLocation()
            );
            this.actions.setPosition({ index: this.index, point: point });
        });
    },

    onStateChange(state) {
        let { point } = state.positionReducer[this.index];
        this.node.setPosition(point || this.initPosition);
    }
});
