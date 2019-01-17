
const normalize = str => str.toLowerCase().replace(/\s+/, ' ');

Vue.use(VueMaterial.default);
var app = new Vue({
  el: '#app',
  data: {
    textFilter: '',
    checkedAttrs: [],
    attrNames: [],
    tunes: []
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
        window.location.href = tune.url;
      }, 300);
    },
    shuffle: function () {
      const last = this.tunes.length - 1;
      for (let i = last; i >= 0; i--) {
        const temp = this.tunes.splice(i, 1);
        this.tunes.splice(Math.floor(Math.random() * last - 1), 0, temp[0]);
      }
    }
  }
});

const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vThlre8GwnVTDD1LMt2yfpqDFSnOMaLtYZT-oGc33sy9hpVs5QhA413wTnKXoYQ-JbwAg7Af2Z8rH_6/pub?gid=5&single=true&output=csv";
const antiCors = "https://sidemen-cors-anywhere.herokuapp.com/";

Papa.parse(antiCors + url, {
  download: true,
  complete: function (results) {
    for (attrName of results.data.shift().slice(2)) {
      app.attrNames.push(attrName);
    }
    for (tune of results.data) {
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
});