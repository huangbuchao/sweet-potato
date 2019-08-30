/**
 * @flow
 */

import Vue from "vue";
import VueUi, { generateHtmlIcon } from "@vue/ui";
import VueVirtualScroller from "vue-virtual-scroller";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
import I18n from "./plugins/i18n";
import Responsive from "./plugins/responsive";
import GlobalRefs from "./plugins/global-refs";
import { keys } from 'shared/env';

Vue.use(VueUi);

Vue.use(VueVirtualScroller);

const currentLocales = "en";
const locales = require.context("./locales");
const replacers = [
  { reg: /<input>/g, replace: '<span class="input-example">' },
  { reg: /<mono>/g, replace: '<span class="mono">' },
  { reg: /<\/(input|mono)>/g, replace: "</span>" },
  { reg: /\[\[(\S+)\]\]/g, replace: '<span class="keyboard">$1</span>' },
  { reg: /<<(\S+)>>/g, replace: (match, p1) => generateHtmlIcon(p1) }
];

Vue.use(I18n, {
  strings: locales(`./${currentLocales}`).default,
  defaultValues: {
    keys
  },
  replacer: text => {
    for (const replacer of replacers) {
      text = text.replace(replacer.reg, replacer.replace);
    }
    return text;
  }
});

Vue.use(Responsive, {
  computed: {
    wide() {
      return this.width >= 1050;
    },
    tall() {
      return this.height >= 350;
    }
  }
});

Vue.use(GlobalRefs, {
  refs: {
    leftScroll: () => document.querySelector('.left .scroll'),
    leftRecycleList: () => document.querySelector('.left .vue-recycle-scroller'),
    rightScroll: () => document.querySelector('.right .scroll')
  }
});

Vue.use(Responsive);