import '../lib';
cc.Class({
    extends: cc.Component,

    properties: {
        images: [cc.SpriteFrame]
    },

    onLoad() {
        this.index = 0;
        this.imageComp = this.node.getComponent(cc.Sprite);
        this.flow();
    },

    flow() {
        this.scheduleOnce(() => {
            this.launch();
            this.run(8);
        }, 4);
    },

    run(time) {
        this.schedule(() => {
            this.launch();
        }, time);
    },

    launch() {
        let sc = [
            cc.fadeOut(4),
            cc.callFunc(() => {
                this.imageComp.spriteFrame = this.images[this.index];
                this.index === 4 ? (this.index = 0) : this.index++;
            }),
            cc.fadeIn(4)
        ];
        this.node.runAction(cc.sequence(...sc));
    }
});
