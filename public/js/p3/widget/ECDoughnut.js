define([
  'dojo/_base/declare', 'dojo/_base/lang',
  'dojo/dom-construct', 'dojo/dom-class',
  'dijit/_WidgetBase', 'dijit/_TemplatedMixin',
  'dojo/text!./templates/ECDoughnut.html'
], function (
  declare, lang,
  domConstruct, domClass,
  _WidgetBase, _TemplatedMixin,
  template
) {
  return declare([_WidgetBase, _TemplatedMixin], {
    baseClass: 'ECDoughnutWidget',
    templateString: template,

    dataModel: 'genome',
    query: '',
    apiServiceUrl: window.App?.dataAPI || '/api',

    postCreate: function () {
      this.inherited(arguments);
      setTimeout(() => this.initChart(), 0);
    },

    _setQueryAttr: function (query) {
      this._set('query', query);
      if (this.chart) {
        this.fetchAndRender(); // update if already rendered
      }
    },

    initChart: function () {

      if (typeof window.echarts === 'undefined') {
        console.error('ECharts not loaded on page!');
        return;
      }

      window.echarts.registerTheme?.('maage', window.echartsTheme);
      this.chart = window.echarts.init(this.chartContainer, 'maage');
      this.fetchAndRender();

      console.debug('ECharts available:', !!window.echarts);
console.debug('Theme available:', !!window.echartsTheme);
console.debug('Chart container:', this.chartContainer);
    },

    fetchAndRender: function () {
      const url = `${this.apiServiceUrl}/${this.dataModel}/?${this.query}&facet((field,isolation_source),(mincount,1))&limit(1)&json(nl,map)`;

      fetch(url, {
        headers: { Accept: 'application/solr+json' }
      })
        .then(r => r.json())
        .then(data => {
          const buckets = data?.facet_counts?.facet_fields?.isolation_source || {};
          const series = Object.entries(buckets)
            .filter(([label]) => !!label)
            .map(([label, count]) => ({ name: label, value: count }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);

          this.chart.setOption({
            title: {
              text: 'Isolation Source',
              left: 'center',
              top: 10,
              textStyle: {
                fontSize: 18,
                fontWeight: 'bold'
              }
            },
            tooltip: {
              trigger: 'item'
            },
            legend: {
              orient: 'vertical',
              left: 'left'
            },
            series: [
              {
                name: 'Isolation Source',
                type: 'pie',
                radius: ['40%', '70%'],
                label: { show: false },
                emphasis: {
                  label: {
                    show: true,
                    fontSize: 14,
                    fontWeight: 'bold'
                  }
                },
                data: series
              }
            ]
          });
        })
        .catch(err => {
          console.error('Failed to load chart data', err);
        });
    }
  });
});