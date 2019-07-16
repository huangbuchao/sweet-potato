cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad() {
        this.index = this.node.getSiblingIndex();
        this.initPosition = this.node.getPosition();
        this.listenEvents();
    },

    listenEvents() {
        this.node.on('touchmove', (e) => {
            let point = this.node.parent.convertToNodeSpaceAR(e.getLocation());
            this.actions.setPosition({ index: this.index, point: point });
            //this.node.setPosition(point);
        });
    },

    onStateChange(state) {
        let { point } = state.positionReducer[this.index];
        this.node.setPosition(point || this.initPosition);
    }
});
