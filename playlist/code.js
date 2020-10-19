
// const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vThlre8GwnVTDD1LMt2yfpqDFSnOMaLtYZT-oGc33sy9hpVs5QhA413wTnKXoYQ-JbwAg7Af2Z8rH_6/pub?gid=5&single=true&output=csv";
// const antiCors = "https://sidemen-cors-anywhere.herokuapp.com/";
const sheetUrl = "tunes.csv";
const antiCors = "https://boisesidemen.com/playlist/";

const normalize = str => str.toLowerCase().replace(/\s+/, ' ').replace(/[^a-z ]+/, '');
const negAttr = name => name.startsWith('!');

// a simple BS seeded RNG to support reproducible shuffles
const randSeed = () => Math.round(Math.random() * 99999)
const nextRand = seed => {
  const nextSeed = ((seed * 9301 + 49297) % 233280);
  return {seed: nextSeed, value: nextSeed / 233280};
}
const nextRandInt = (seed, limit) => {
  const { seed: nextSeed, value } = nextRand(seed);
  return { seed: nextSeed, value: Math.floor(value * (limit + 1)) };
}

Vue.use(VueMaterial.default);
var app = new Vue({
  el: '#app',
  data: {
    textFilter: '',
    checkedAttrs: [],
    positiveAttrs: [],
    negativeAttrs: [],
    tunes: [],
    shuffleSeed: undefined,
    message: null,
  },
  computed: {
    dirty: function () {
      return this.textFilter || this.shuffleSeed || this.checkedAttrs.join() !== this.negativeAttrs.join();
    },
    filtered: function () {
      const text = normalize(this.textFilter);
      const suppressed = this.tunes.filter(tune => 
        tune.attrs.reduce((r, v) => r && !(negAttr(v) && this.checkedAttrs.includes(v)), true)
      );
      let filtered = suppressed.filter(tune => tune.search.indexOf(text) > -1 &&
        this.checkedAttrs.reduce((r, v) => r && (negAttr(v) || tune.attrs.includes(v)), true)
      );
      if (this.shuffleSeed) {
        const len = filtered.length;
        for (let i = 0, seed = this.shuffleSeed; i < len; i++) {
          const temp = filtered.splice(i, 1);
          let { seed: nextSeed, value } = nextRandInt(seed, len-1);
          filtered.splice(value, 0, temp[0]);
          seed = nextSeed;
        }
      }
      return filtered;
    },
  },
  methods: {
    visit: function (tune) {
      setTimeout(function() {
        window.open(tune.url, "_blank");
      }, 300);
    },
    shuffle: function () {
      this.shuffleSeed = randSeed();
    },
    reset: function () {
      this.textFilter = '';
      this.shuffleSeed = undefined;
      this.checkedAttrs = this.negativeAttrs.slice();
    }
  },
  mounted: function () {
    this.$nextTick(function () {
      const cachedData = localStorage.getItem('cachedData'); 
      if (cachedData) loadRaw(JSON.parse(cachedData));
    });
    this.$nextTick(function () {
      Papa.parse(antiCors + sheetUrl, {
        download: true,
        error: (e) => { app.message = 'Error Loading Data: ' + e; },
        complete: results => loadRaw(results.data)
      });
    });
  }
});

function loadRaw(data) {
  localStorage.setItem('cachedData', JSON.stringify(data));

  const attrNames = data.shift().slice(3);
  app.positiveAttrs = attrNames.filter(name => !negAttr(name));
  app.negativeAttrs = attrNames.filter(name => negAttr(name));
  app.checkedAttrs = app.negativeAttrs.slice();

  app.tunes = [];
  for (tune of data) {
    const name = tune.shift();
    const filename = tune.shift();
    const notes = tune.shift();
    let attrs = tune.reduce((r, v, i) => v === 'TRUE' ? [...r, attrNames[i]] : r, []);
    app.tunes.push({
      name,
      notes,
      attrs,
      url: filename ? `files/${filename}` : encodeURI(`nofile.html?name=${name}`),
      search: normalize(name + ' ' + notes)
    });
  }
}
