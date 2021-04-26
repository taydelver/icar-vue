<template>
  <div class="wbctz-pagination">
    <span @click="onFirst" :class="{disabled: isDisabled('first')}" class="wbctz-pagination-btn wbctz-pagination-btn--first">First</span>
    <span @click="onPrev" :class="{disabled: isDisabled('first')}" class="wbctz-pagination-btn wbctz-pagination-btn--prev">
      <i class="fa fa-chevron-left"></i>
    </span>
    <div class="wbctz-pagination-results">
      {{resultsText}}
    </div>
    <span @click="onNext" class="wbctz-pagination-btn wbctz-pagination-btn--next">
      <i class="fa fa-chevron-right"></i>
    </span>
    <span @click="onLast" class="wbctz-pagination-btn wbctz-pagination-btn--last">Last</span>
  </div>
</template>

<script>
export default {
  props: ['from', 'to', 'last', 'total', 'perPage', 'current', 'resultsText'],
  data() {
    return {

    }
  },
  methods: {
    isDisabled(btn) {
      if(btn == 'first') {
        return this.currentPageInt > 1
      }
    },
    onFirst() {
      if(this.currentPageInt !== 1) {
        this.goToPage(1)
      }
    },
    onNext() {
      if(this.currentPageInt < this.lastInt) {
        this.goToPage(this.currentPageInt + 1)
      }
    },
    onLast() {
      if(this.currentPageInt !== this.lastInt) {
        this.goToPage(this.lastInt)
      }
    },
    onPrev() {
      if(this.currentPageInt > 1) {
        this.goToPage(this.currentPageInt - 1)
      }
    },
    goToPage(page) {
      this.$emit('change', page)
    }
  },
  computed: {
    currentPageInt() {
      return !this.current ? 1 : parseInt(this.current, 10)
    },
    totalInt() {
      return parseInt(this.total, 10)
    },
    lastInt() {
      return parseInt(this.last, 10)
    }
  }
}
</script>

<style>

</style>