<template>
  <div id="app" class="app">
    <datalist>
      <option v-for="(value, key) of specialTokens" :key="key" :value="key"></option>
    </datalist>
    <div class="header">
      <img src="./assets/sp200.png" alt="vue-log" class="log" />
      <span class="message-container">
        <transition name="slide-up">
          <span :key="message" class="message">
            <span class="text">{{ message }}</span>
          </span>
        </transition>
      </span>
      <div class="actions">
        <VueGroup v-model="routeModel" class="primary inline" indicator>
          <VueGroupButton
            v-tooltip="$t('App.components.tooltip')"
            value="components"
            icon-left="subject"
            class="components-tab flat"
          >
            Components
          </VueGroupButton>
          <VueGroupButton value="store" icon-left="store" class="components-tab flat">
            Store
          </VueGroupButton>
          <VueGroupButton value="router" icon-left="toys" class="components-tab flat">
            Travel
          </VueGroupButton>
          <VueGroupButton value="stats" icon-left="equalizer" class="components-tab flat">
            Profiler
          </VueGroupButton>
          <VueGroupButton
            v-tooltip="$t('App.settings.tooltip')"
            :class="{
              'icon-button': !$responsive.wide
            }"
            value="setting"
            icon-left="settings_applications"
            class="settings-tab flat"
            @focus.native="isRouterGroupOpen = false"
          >Settings
          </VueGroupButton>
        </VueGroup>
        <VueButton
            ref="refresh"
            v-tooltip="$t('App.refresh.tooltip')"
            class="refresh-button flat"
            :class="{
            'icon-button': !$responsive.wide
          }"
            icon-left="refresh"
            @click="refresh"
          >
            Refresh
        </VueButton>
      </div>
    </div>

    <router-view class="container" />
  </div>
</template>

<script>
import { SPECIAL_TOKENS } from "shared/util";
import GroupDropdown from "./components/GroupDropdown.vue";
import { mapState } from "vuex";

export default {
  name: "App",

  components: {
    GroupDropdown
  },

  data() {
    return {
      isRouterGroupOpen: false,
      routingTabs: [
        { name: "router", label: "History", icon: "directions" },
        { name: "routes", label: "Routes", icon: "book" }
      ],
      settingsVersion: ""
    };
  },

  computed: {
    ...mapState({
      message: state => state.message,
      view: state => state.view
    }),

    specialTokens() {
      return SPECIAL_TOKENS;
    },

    routeModel: {
      get() {
        return this.$route.matched[0].name;
      },
      set(value) {
        this.$router.push({ name: value });
        this.$nextTick(() => {
          console.log(`next tick: ${value} rendered`);
        });
      }
    }
  },

  mounted() {
    this.mediaQuery = window.matchMedia("(min-width: 685px)");
    this.switchView(this.mediaQuery);
    this.mediaQuery.addListener(this.switchView);
  },

  destroyed() {
    this.mediaQuery.removeListener(this.switchView);
  },

  methods: {
    refresh() {
      const refreshIcon = this.$refs.refresh.$el.querySelector(".vue-ui-icon");
      refreshIcon.style.animation = "none";

      bridge.send("refresh");
      setTimeout(() => {
        refreshIcon.style.animation = "rotate 1s";
      }, 100);
    },

    switchView(mediaQueryEvent) {
      this.$store.commit(
        "SWITCH_VIEW",
        mediaQueryEvent.matches ? "vertical" : "horizontal"
      );
    }
  }
};
</script>

<style lang="stylus" src="./style/global.styl"></style>

<style lang='stylus' scoped>
.app
  width: 100%;
  height: 100%;
  user-select: none;
  background-color: $background-color;
  display: flex;
  flex-direction: column;
  position: relative;
  .vue-ui-dark-mode &
    background-color $dark-background-color
  .vue-ui-high-contrast &
    background black

.header
  display: flex;
  align-items: center;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
  font-size: 14px;
  position: relative;
  .vue-ui-dark-mode &
    border-bottom 1px solid $dark-border-color

.message-container
  height: 1em;
  cursor: default;
  display: none;

  @media (min-width: $wide - 300px) {
    display: block;
  }

.message {
  color: $active-color;
  transition: all 1s ease;
  position: absolute;
  display: flex;
  align-items: center;
}

.log {
  width: 30px;
  height: 30px;
  margin: 0 15px;
}

.actions {
  display: flex;
  flex: auto 1 1;
  justify-content: flex-end;
}

.vue-ui-button {
  height: 38px;

  @media (max-width: $wide) {
    width: 38px;

    /deep/ {
      .button-icon.left {
        margin-right: 0 !important;
      }

      .default-slot {
        display: none;
      }
    }
  }

  @media (min-height: $tall) {
    height: 48px;

    @media (max-width: $wide) {
      width: @height;
    }
  }
}

.vue-ui-group /deep/ > .indicator {
  padding-bottom: 0 !important;
}

.container {
  height: calc(100% - 60px);
  position: relative;
  overflow: hidden;
  flex: 1;
}

.hide-below-wide {
  @media (max-width: $wide) {
    display: none;
  }
}
</style>
