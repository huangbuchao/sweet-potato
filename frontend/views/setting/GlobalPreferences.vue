<template>
  <div class="global-preferences preferences">

    <VueFormField title="Theme">
      <VueGroup
        v-model="$shared.theme"
        class="extend"
      >
        <VueGroupButton
          value="light"
          label="Light"
        />
        <VueGroupButton
          value="dark"
          label="Dark"
        />
      </VueGroup>
    </VueFormField>

  </div>
</template>

<script>
export default {

}
</script>
