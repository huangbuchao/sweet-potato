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
export default {

}
</script>

<style lang="stylus" scoped>

</style>