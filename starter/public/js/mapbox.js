/* eslint-disable */
export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1Ijoia2FyYW42MDUyNSIsImEiOiJjbXZhbXkybXkwN2FmMnhyMHJtemo5Y2x6In0.iqY10F_7ubl9CT8CM5cxmg';

  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/karan60525/cmw6ppw4w00wb01r14sccerbe',
    scrollZoom: false,
    // center: [-118.113491, 34.111745],
    // zoom: 10,
    // interactive: false
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.on('load', () => {
    map.resize();

    map.fitBounds(bounds, {
      padding: 60,
      maxZoom: 12,
      duration: 1000,
    });
  });
};
