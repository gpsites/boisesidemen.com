
const sheetUrl = "tunes.csv";
const antiCors = "";

const normalize = str => str.toLowerCase().replace(/\s+/, ' ');

Vue.use(VueMaterial.default);
var app = new Vue({
  el: '#app',
  data: {
    textFilter: '',
    checkedAttrs: [],
    attrNames: [],
    tunes: [],
    message: null,
  },
  computed: {
    filtered: function () {
      const text = normalize(this.textFilter);
      return this.tunes.filter(tune => tune.search.indexOf(text) > -1 &&
        this.checkedAttrs.reduce((r, v) => r && tune.attrs.includes(v), true)
      );
    },
  },
  methods: {
    visit: function (tune) {
      setTimeout(function() {
        window.open(tune.url, "_blank");
      }, 300);
    },
    shuffle: function () {
      const last = this.tunes.length - 1;
      for (let i = last; i >= 0; i--) {
        const temp = this.tunes.splice(i, 1);
        this.tunes.splice(Math.floor(Math.random() * last - 1), 0, temp[0]);
      }
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

  app.attrNames = data.shift().slice(2);

  app.tunes = [];
  for (tune of data) {
    const name = tune.shift();
    const notes = tune.shift();
    let attrs = tune.reduce((r, v, i) => v === 'TRUE' ? [...r, app.attrNames[i]] : r, []);
    app.tunes.push({
      name,
      notes,
      attrs,
      url: 'files/' + name,
      search: normalize(name + ' ' + notes)
    });
  }
}
