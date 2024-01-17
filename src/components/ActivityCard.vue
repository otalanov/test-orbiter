<script>
  import relativeTime from 'dayjs/plugin/relativeTime.js'
export default {
  name: 'ActivityCard',
  data() {
    return {
      isExpandedMsg: false,
    }
  },
  methods: {
    getActivityTimeFull(date) {
      return this.$date(date).format('dddd MMMM D h mm A');
    },
    getActivityTimeFromNow(date) {
      this.$dayjs.extend(relativeTime)
      return this.$date(date).fromNow();

    }
  },
  props: {
    contactData: Object
  }
}
</script>

<template>
  <div class="activity-container">
    <div class="activity-header d-flex">
      <div class="activity-logo">
        <img width="50" src="../assets/images/icons/logo1.png" alt="logo">
      </div>
      <div class="activity-photo">
        <img :src="contactData.img" alt="photo">
      </div>
      <div class="activity-info">
        <p class="activity-contact-name"><strong>{{ contactData.name }}</strong></p>
        <p class="activity-contact-position">{{ contactData.position }}</p>
        <p class="activity-contact-city">{{ contactData.city }}</p>
        <div class="activity-contact-mutual d-flex">
          <div class="mutual-img-container">
            <img src="../assets/images/mutual-connections.svg" alt="placeolder">
          </div>
          <p>
            Jason Diamond, John Eremic, and 281 other mutual connections
          </p>
        </div>
      </div>

    </div>

    <div class="activity-content">
      <div class="activity-content-header">
        <i class="icon-mail"><img width="18" src="../assets/images/icons/icon-mail.svg" alt="mail"></i>
        <span class="activity-reply-from">Reply from Emery Wells</span>
      </div>
      <div class="activity-content">
        <div class="activity-message-container">
          <div class="activity-message-time d-flex">
            <div class="activity-time-left">
              <span class="text-gray">{{ getActivityTimeFull(contactData.created_at) }}</span>
            </div>
            <div class="activity-time-right">
              <span class="text-gray">{{ getActivityTimeFromNow(contactData.created_at )}}</span>
            </div>
          </div>
          <div class="activity-message-body">
            <p class="text"><strong>{{ contactData._orbits_last_message.message_head }}</strong></p>
            <p class="text" :class="{'overflow-ellipsis': !isExpandedMsg}">
              {{ contactData._orbits_last_message.message }}
            </p>
            <button class="btn btn-expand" @click="isExpandedMsg = !isExpandedMsg">
              {{ isExpandedMsg ? 'Less' : 'More'}}
              <i class="icon-caret" :class="{'icon-rotate-180': isExpandedMsg}">
                <img width="12" src="../assets/images/icons/caret.svg">
              </i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>