<script>
import axios from "axios";
import ActivityCard from '@/components/ActivityCard.vue'

export default {
  components: { ActivityCard },
  data() {
    return {
      CIRCLE_QUANTITY: 7,
      RATIO: 1.87,
      SVGNS: 'http://www.w3.org/2000/svg',
      CONTACT_ICON_SIZE: 60,
      activeCircleDaysRange: [],
      isLoading: false,
      currentActiveDay: null,
      baseCircleRadius: null,
      circleX: null,
      circleY: null,
      viewportHeight: null,
      viewportWidth: null,
      circles: []
    }
  },

  methods: {
    init() {
      this.initBaseCirclesParams();
      this.initActiveDaysWindow();
      this.fetchData()
        .then(() => {
          this.populateCirclesDataFromStorage();
        })
    },

    initActiveDaysWindow() {
      this.currentActiveDay = this.$date().format('YYYY-MM-DD');
      let activeDay = this.currentActiveDay;
      for (let i = 0; i <= 7; i++) {
        this.activeCircleDaysRange.push(activeDay);
        activeDay = this.$date(activeDay).subtract(1,'day').format('YYYY-MM-DD');
      }
    },

    initBaseCirclesParams() {
      this.viewportWidth = document.documentElement.clientWidth;
      this.viewportHeight = document.documentElement.clientHeight;
      const actualRatio = this.viewportWidth / this.viewportHeight;
      const magicFactor = actualRatio / this.RATIO; // helps circle fit on viewport for different screens
      this.baseCircleRadius = this.viewportWidth/(2 * this.CIRCLE_QUANTITY) / magicFactor;
      this.circleX = this.viewportWidth/2;
      this.circleY = this.viewportHeight;
    },

    populateCirclesDataFromStorage() {
      this.activeCircleDaysRange.forEach(day => {
        if (!this.circles.some(circleData => circleData.contact_date === day)) {
          this.circles.push({
            contact_date: day,
            array: JSON.parse(localStorage.getItem(day))?.array
          })
        }
      });

      const removeIndex = this.circles.findIndex(circleData => !this.activeCircleDaysRange.includes(circleData.contact_date))
      if (removeIndex > -1) {
        this.circles.splice(removeIndex, 1);
      }

      this.circles.sort((a,b) => {
        return this.$date(a.contact_date).isAfter(this.$date(b.contact_date)) ? 1 : -1
      });
    },

    getContactX(circleIndex, contactIndex, contactsCount) {
      if (contactsCount === 1) { // todo: fix the formula
        contactsCount = 3;
        contactIndex = 2;
      }
      const r = this.baseCircleRadius * circleIndex;
      const angle = (Math.PI * contactIndex)/(contactsCount-1)
      return r * Math.cos(angle) + this.circleX - this.CONTACT_ICON_SIZE/2;
    },

    getContactY(circleIndex, contactIndex, contactsCount) {
      if (contactsCount === 1) { // todo: fix the formula
        contactsCount = 3;
        contactIndex = 2;
      }
      const r = this.baseCircleRadius * circleIndex;
      const angle = (Math.PI * contactIndex)/(contactsCount-1)
      return this.viewportHeight - r * Math.sin(angle) - this.CONTACT_ICON_SIZE/2;
    },

    handleScroll(event) {
      if (!this.isLoading) { // todo: use debounce
        const direction = Math.sign(event.wheelDeltaY);
        if (direction === 1) {
          this.handleScrollUp();
        } else if (direction === -1) {
          this.handleScrollDown();
        }
      }
    },

    isToday(date) {
      return this.$date(date).isSame(this.$date(), 'day');
    },

    handleScrollUp() {
      this.currentActiveDay = this.$date(this.currentActiveDay).subtract(1, 'day').format('YYYY-MM-DD');
      this.activeCircleDaysRange.push(this.$date(this.currentActiveDay).subtract(7, 'day').format('YYYY-MM-DD'));
      this.activeCircleDaysRange.shift();
      this.populateCirclesDataFromStorage();
      this.fetchData();
    },

    handleScrollDown() {
      if (!this.isToday(this.currentActiveDay)) {
        this.currentActiveDay = this.$date(this.currentActiveDay).add(1, 'day').format('YYYY-MM-DD');
        this.activeCircleDaysRange.unshift(this.currentActiveDay);
        this.activeCircleDaysRange.pop();
        this.populateCirclesDataFromStorage();
        this.fetchData();
      }
    },

    async fetchData() {
      return axios.get(
          'https://xwmi-5dlx-wkyj.t7.xano.io/api:oUvfVMO5/receive_week',
          {params: {'start_date': this.currentActiveDay}})
        .then(res => {
          this.syncDataStorage(res.data)
        })
        .catch(err => console.error('HTTP Request Error', err));
    },

    syncDataStorage(data) {
      data.forEach(day => {
        if (!localStorage.getItem(day.contact_date)) {
          localStorage.setItem(day.contact_date, JSON.stringify(day))
        }
      })
    },
  },

  mounted() {
    localStorage.clear();
    this.init();
  },

}
</script>
<template>
  <div v-on:wheel="handleScroll" :style="{'font-size': 'green'}">
    <div class="container" :style="{'height': viewportHeight + 'px', 'width':viewportWidth + 'px'}">
      <svg v-if="circles?.length" ref="orbiter-svg-ref" id="orbiter-svg" class="orbiter-svg" :height="viewportHeight" :width="viewportWidth" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="circle-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="rgba(255,255,255,1)" />
            <stop offset="100%" stop-color="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>
        <template v-for="(circle, circleIndex) in circles" :key="circle.contact_date">
<!--          {{ 'circleIndex' + circleIndex }}-->
<!--          {{ circle?.array?.length }}-->
          <circle v-if="!circleIndex"
                  :id="circle.contact_date"
                  :r="baseCircleRadius * (circleIndex)"
                  :cx="circleX"
                  :cy="circleY"
                  class="circle circle-next-day opacity-0"
                  stroke="url(#circle-gradient)"
                  stroke-width="1"
                  fill="none">
          </circle>
          <circle v-if="circleIndex"
                  :id="'circle-' + circle.contact_date"
                  :r="baseCircleRadius * (circleIndex)"
                  :cx="circleX"
                  :cy="circleY"
                  class="circle"
                  stroke="url(#circle-gradient)"
                  stroke-width="1"
                  fill="none">
          </circle>
          <foreignObject v-for="(contact, contactIndex) in circle?.array"
                         :key="contact.id"
                         :x="getContactX(circleIndex, contactIndex, circle.array?.length)"
                         :y="getContactY(circleIndex, contactIndex, circle.array?.length)"
                         :class="circleIndex ? 'contact-container' : 'contact-container opacity-0'"
                         :width="60"
                         :height="60">
            <div class="contact-item">
              <div class="contact-img-container">
                <img class="contact-img" :src="contact.img" :alt="contact.name" width="58">
              </div>
              <div class="contact-card">
                <ActivityCard :contactData="contact"></ActivityCard>
              </div>
            </div>
          </foreignObject>
        </template>
      </svg>
    </div>

  </div>
</template>

<style>
  svg.orbiter-svg {
    height: 100%;
    width: 100%;
  }
</style>