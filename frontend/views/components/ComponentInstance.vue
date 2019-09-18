<template>
	<div
		:class="{
			inactive: instance.inactive && !instance.parent.inactive,
			selected
		}"
		class="instance"
	>
		<div
			ref="self"
			:class="{
				selected
			}"
			class="self selectable-item"
			:style="{
				paddingLeft: depth * 15 + 'px'
			}"
			@click.stop="select"
			@dblclick.stop="toggle"
			@mouseenter="enter"
			@mouseleave="leave"
		>
			<span class="content">
				<span
					v-if="instance.children.length"
					class="arrow-wrapper"
					@click.stop="toggle"
				>
					<span
						:class="{
							rotated: expanded
						}"
						class="arrow right"
					/>
				</span>

				<span class="angle-bracket">&lt;</span>

				<span class="item-name">{{displayName}}</span>

				<span
					v-if="componentHaskey"
					class="attr"
				>
					<span class="attr-title">renderClassAmount</span>:<span class="attr-value">{{instance.renderAmount}}</span>
				</span>

				<span class="angle-bracket">&gt;</span>
			</span>

			 <span
        v-if="instance.consoleId"
        v-tooltip="$t('ComponentInstance.consoleId.tooltip', { id: instance.consoleId })"
        class="info console"
      >
        = {{ instance.consoleId }}
      </span>

			<span class="spacer" />

			<VueIcon
        v-tooltip="'Scroll into view'"
        class="icon-button"
        icon="visibility"
        @click="scrollToInstance"
      />
		</div>
		<div
			v-if="expanded"
		>
			<component-instance
				v-for="child in sortedChildren"
				:key="child.id"
				:instance="child"
				:depth="depth + 1"
			/>
		</div>
	</div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import { getComponentDisplayName, scrollIntoView, UNDEFINED } from 'shared/util';

export default {
	name: 'ComponentInstance',

	props: {
    instance: {
      type: Object,
      required: true
    },
    depth: {
      type: Number,
      required: true
    }
	},

	computed: {
		...mapState("components", [
			'expansionMap',
      'inspectedInstance',
      'inspectedInstanceId',
      'scrollToExpanded'
		]),

		expanded() {
			return !!this.expansionMap[this.instance.id];
		},

		selected() {
			return this.instance.id === this.inspectedInstanceId;
		},

		sortedChildren() {

		},

		displayName() {

		},

		componentHasKey() {

		}
	},

	watch: {
		scrollToExpanded() {

		}
	},

	created() {

	},

	methods: {
		...mapMutations(),

		toggle() {

		},

		toggleWithValue() {

		},

		expand() {

		},

		collapse() {

		},

		enter() {

		},

		leave() {

		},

		select() {

		},

		scrollToInstance() {

		},

		scrollToView() {

		},
	}
}
</script>

<style lang="stylus" scoped>
.self
</style>