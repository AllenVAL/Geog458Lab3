mapboxgl.accessToken = 'pk.eyJ1IjoiYWxsZW55dWFuIiwiYSI6ImNtaGU0eGxpNzBhZmQyanEyY3pxZDFoM3oifQ.3KmK2WRpvAGKu9R2l2mHVA';

const page = window.location.href;

let map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [-96, 37.5],
  zoom: 3,
  projection: 'albers'
});

const legend = document.getElementById('legend');

map.on('load', () => {

    //MAP 1: Choropleth (rates)
  if (page.includes('map1.html')) {

    map.addSource('covid-rates', {
      type: 'geojson',
      data: 'assets/us-covid-2020-rates.json'
    });

    const breaks = [0, 10, 20, 40, 80];
    const colors = [
    'rgb(254,229,217)',
    'rgb(252,174,145)',
    'rgb(251,106,74)',
    'rgb(222,45,38)',
    'rgb(165,15,21)'
    ];


    map.addLayer({
      id: 'rates-fill',
      type: 'fill',
      source: 'covid-rates',
      paint: {
        'fill-color': [
          'step',
          ['to-number', ['get', 'rates']],
          colors[0],
          breaks[1], colors[1],
          breaks[2], colors[2],
          breaks[3], colors[3],
          breaks[4], colors[4]
        ],
        'fill-opacity': 0.75,
        'fill-outline-color': 'rgba(255,255,255,0.2)'
      }
    });

    map.on('click', 'rates-fill', (e) => {
    const p = e.features[0].properties;
    new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(`<strong>${p.county}</strong><br/>Rate: ${p.rates}`)
        .addTo(map);
    });


    // legend labels
    let labels = ['<strong>Rate (per 1,000)</strong>'];
    for (let i = 0; i < breaks.length; i++) {
      const from = breaks[i];
      const to = breaks[i + 1];
      const label = (to === undefined) ? `${from}+` : `${from}–${to}`;
      labels.push(
        `<p class="break"><span class="swatch" style="background:${colors[i]};"></span>${label}</p>`
      );
    }

    const source =
      '<p style="text-align: right; font-size:10pt">Source: NYT (cases), ACS 2018 (pop), Census counties</p>';

    legend.innerHTML = labels.join('') + source;
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
        'circle-stroke-color': 'white',
        'circle-stroke-width': 1,
        'circle-opacity': 0.6
      }
    });

    map.on('click', 'cases-point', (e) => {
      const p = e.features[0].properties;

      new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(`<strong>${p.county}</strong><br/>Cases: ${p.cases}`)
        .addTo(map);
    });

    // legend 
    let labels = ['<strong>Cases</strong>'];
    for (let i = 0; i < grades.length; i++) {
      const vbreak = grades[i];
      const dot_radii = 2 * radii[i];
      labels.push(
        '<p class="break"><i class="dot" style="background:' + colors[i] +
        '; width:' + dot_radii + 'px; height:' + dot_radii +
        'px;"></i> <span class="dot-label" style="top:' + (dot_radii / 2) + 'px;">' +
        vbreak.toLocaleString() + '</span></p>'
      );
    }

    const source =
      '<p style="text-align: right; font-size:10pt">Source: NYT (cases), Census counties</p>';

    legend.innerHTML = labels.join('') + source;
  }

});
