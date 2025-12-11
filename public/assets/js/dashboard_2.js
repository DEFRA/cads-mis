document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('os-year').textContent = new Date().getFullYear()

  // OS Maps Outdoor_3857 with MapLibre
  const apiKey = '97RSCqCjaAT68LDVbfDZs0qhVKLblVJ8'

  const style = {
    version: 8,
    sources: {
      'os-outdoor': {
        type: 'raster',
        tiles: [
          'https://api.os.uk/maps/raster/v1/zxy/Outdoor_3857/{z}/{x}/{y}.png?key=' +
            apiKey
        ],
        tileSize: 256
      }
    },
    layers: [
      {
        id: 'os-outdoor-layer',
        type: 'raster',
        source: 'os-outdoor'
      }
    ]
  }

  // eslint-disable-next-line no-undef
  const map = new maplibregl.Map({
    container: 'animal-map',
    style,
    center: [-2.5, 54.3],
    zoom: 5.5,
    minZoom: 5,
    maxZoom: 18,
    maxBounds: [
      [-10.76418, 49.528423],
      [1.9134116, 61.331151]
    ],
    attributionControl: false
  })

  map.dragRotate.disable()
  map.touchZoomRotate.disableRotation()

  map.addControl(
    // eslint-disable-next-line no-undef
    new maplibregl.NavigationControl({
      showCompass: false
    })
  )

  // Example animal movement holdings – replace with real coordinates
  const animalMovements = [
    { name: 'Birth holding', lon: -3.05, lat: 55.95 },
    { name: 'Market', lon: -2.25, lat: 53.48 },
    { name: 'Finishing holding', lon: -2.9, lat: 54.9 },
    { name: 'Slaughterhouse', lon: -1.55, lat: 53.8 },
    { name: 'Last known holding', lon: -2.93, lat: 54.9 }
  ]

  animalMovements.forEach((m) => {
    // eslint-disable-next-line no-undef
    new maplibregl.Marker({ color: '#1d70b8' })
      .setLngLat([m.lon, m.lat])
      .setPopup(
        // eslint-disable-next-line no-undef
        new maplibregl.Popup({ offset: 8 }).setHTML(
          `<strong>${m.name}</strong>`
        )
      )
      .addTo(map)
  })

  // D3: simple single-series vertical bar chart for moves by year
  function renderSimpleBarChart(selector, data, config) {
    // eslint-disable-next-line no-undef
    const svg = d3.select(selector)
    const node = svg.node()
    if (!node) return

    const width = node.clientWidth || 360
    const height = node.clientHeight || 220
    svg.attr('viewBox', `0 0 ${width} ${height}`)

    const margin = { top: 10, right: 20, bottom: 40, left: 40 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // eslint-disable-next-line no-undef
    const x = d3
      .scaleBand()
      .domain(data.map((d) => d[config.categoryKey]))
      .range([0, innerWidth])
      .padding(0.4)

    // eslint-disable-next-line no-undef
    const y = d3
      .scaleLinear()
      // eslint-disable-next-line no-undef
      .domain([0, d3.max(data, (d) => d[config.valueKey])])
      .nice()
      .range([innerHeight, 0])

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      // eslint-disable-next-line no-undef
      .call(d3.axisBottom(x))

    // eslint-disable-next-line no-undef
    g.append('g').call(d3.axisLeft(y).ticks(5))

    g.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d) => x(d[config.categoryKey]))
      .attr('y', (d) => y(d[config.valueKey]))
      .attr('width', x.bandwidth())
      .attr('height', (d) => innerHeight - y(d[config.valueKey]))
      .attr('fill', '#1d70b8')
  }

  const movesByYear = [
    { year: '2019', moves: 1 },
    { year: '2020', moves: 3 },
    { year: '2021', moves: 2 },
    { year: '2022', moves: 4 },
    { year: '2023', moves: 2 }
  ]

  renderSimpleBarChart('#chart-moves-year', movesByYear, {
    categoryKey: 'year',
    valueKey: 'moves'
  })
})
