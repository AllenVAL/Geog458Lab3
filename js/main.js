mapboxgl.accessToken = 'pk.eyJ1IjoiYWxsZW55dWFuIiwiYSI6ImNtaGU0eGxpNzBhZmQyanEyY3pxZDFoM3oifQ.3KmK2WRpvAGKu9R2l2mHVA';

const page = window.location.pathname;

let map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [-96, 37.5],
  zoom: 3,
  projection: 'albers'
});

map.on('load', () => {

     //MAP 1: Choropleth (rates)
  if (page.includes('map1.html')) {

    map.addSource('covid-rates', {
      type: 'geojson',
      data: 'assets/us-covid-2020-rates.json'
    });

    map.addLayer({
      id: 'rates-fill',
      type: 'fill',
      source: 'covid-rates',
      paint: {
        'fill-color': [
          'step',
          ['to-number', ['get', 'rate']],
          '#f2f2f2',
          10, '#cccccc',
          20, '#969696',
          40, '#636363',
          80, '#252525'
        ],
        'fill-opacity': 0.75
      }
    });

    map.on('click', 'rates-fill', (e) => {
      const p = e.features[0].properties;
      new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(`<strong>${p.NAME}</strong><br/>Rate: ${p.rate}`)
        .addTo(map);
    });

  }
     //MAP 2: Proportional symbols (cases)
  if (page.includes('map2.html')) {

    const grades = [10000, 50000, 200000];
    const colors = ['rgb(208,209,230)', 'rgb(103,169,207)', 'rgb(1,108,89)'];
    const radii = [4, 10, 18];

    map.addSource('covid-counts', {
      type: 'geojson',
      data: 'assets/us-covid-2020-counts.json'
    });

    map.addLayer({
      id: 'cases-point',
      type: 'circle',
      source: 'covid-counts',
      paint: {
        'circle-radius': {
          'property': 'cases',
          'stops': [
            [grades[0], radii[0]],
            [grades[1], radii[1]],
            [grades[2], radii[2]]
          ]
        },
        'circle-color': {
          'property': 'cases',
          'stops': [
            [grades[0], colors[0]],
            [grades[1], colors[1]],
            [grades[2], colors[2]]
          ]
        },
        'circle-opacity': 0.6,
        'circle-stroke-color': 'white',
        'circle-stroke-width': 1
      }
    });

    map.on('click', 'cases-point', (e) => {
      const p = e.features[0].properties;
      new mapboxgl.Popup()
        .setLngLat(e.features[0].geometry.coordinates)
        .setHTML(`<strong>${p.NAME}</strong><br/>Cases: ${p.cases}`)
        .addTo(map);
    });

  }

});
