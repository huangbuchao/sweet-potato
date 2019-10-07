/**
 * @flow
 */

import Vue from "vue";
import Vuex from "vuex";
import components from "../views/components/module.js";
import router from "../views/router/module";
import stats from "../views/stats/module";
import stores from "../views/store/module";

Vue.use(Vuex);

export function createStore() {
  const store = new Vuex.Store({
    state: () => ({
      message: "",
      view: "vertical"
    }),
    mutations: {
      SHOW_MESSAGE(state, message) {
        state.message = message;
      },
      SWITCH_VIEW(state, view) {
        state.view = view;
      },
      RECEIVE_INSTANCE_DETAIL(state, instance) {
        state.message = "Instance selected: " + instance.name;
      }
    },
    modules: {
      components,
      router,
      stats,
      stores
    }
  });

  if (module.hot) {
    module.hot.accept(
      [
        "../views/components/module",
        "../views/router/module",
        "../views/stats/module",
        "../views/store/module"
      ],
      () => {
        try {
          store.hotUpdate({
            modules: {
              components: require("../views/components/module").default,
              router: require("../views/router/module").default,
              stats: require("../views/stats/module").default,
              stores: require("../views/store/module").default
            }
          });
        } catch (error) {
          console.log(error.stack);
        }
      }
    );
  }

  return store;
}
