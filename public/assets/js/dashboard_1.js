document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('os-year').textContent = new Date()
    .getFullYear()
    .toString()

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
    container: 'holding-map',
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

  // Example holdings – colours map to the legend
  const holdings = [
    {
      name: 'Thrift Farm (this holding)',
      lon: 0.75,
      lat: 51.73,
      moves: 0,
      type: 'both'
    },
    { name: 'North Moor Farm', lon: -1.5, lat: 53.8, moves: 120, type: 'in' },
    {
      name: 'Riverbank Holdings',
      lon: -1.1,
      lat: 52.6,
      moves: 85,
      type: 'out'
    },
    { name: 'Hilltop Livestock', lon: -2.0, lat: 55.2, moves: 60, type: 'both' }
  ]

  function colourForType(t) {
    if (t === 'in') return '#1d70b8' // blue
    if (t === 'out') return '#f47738' // orange
    if (t === 'both') return '#28a197' // teal
    return '#b1b4b6'
  }

  holdings.forEach((h) => {
    // eslint-disable-next-line no-undef
    new maplibregl.Marker({
      color: colourForType(h.type)
    })
      .setLngLat([h.lon, h.lat])
      .setPopup(
        // eslint-disable-next-line no-undef
        new maplibregl.Popup({ offset: 8 }).setHTML(
          `<strong>${h.name}</strong><br>Movements with holding: ${h.moves}`
        )
      )
      .addTo(map)
  })

  // D3: grouped vertical bar chart helper (two series, two colours)
  function renderGroupedBarChart(selector, data, config) {
    // eslint-disable-next-line no-undef
    const svg = d3.select(selector)
    const node = svg.node()
    if (!node) return

    const width = node.clientWidth || 360
    const height = node.clientHeight || 260
    svg.attr('viewBox', `0 0 ${width} ${height}`)

    const margin = { top: 10, right: 20, bottom: 40, left: 60 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // eslint-disable-next-line no-undef
    const x0 = d3
      .scaleBand()
      .domain(data.map((d) => d[config.categoryKey]))
      .range([0, innerWidth])
      .paddingInner(0.2)

    // eslint-disable-next-line no-undef
    const x1 = d3
      .scaleBand()
      .domain(config.seriesKeys)
      .range([0, x0.bandwidth()])
      .padding(0.1)

    // eslint-disable-next-line no-undef
    const y = d3
      .scaleLinear()
      // eslint-disable-next-line no-undef
      .domain([0, d3.max(data, (d) => d3.max(config.seriesKeys, (k) => d[k]))])
      .nice()
      .range([innerHeight, 0])

    // eslint-disable-next-line no-undef
    const colour = d3
      .scaleOrdinal()
      .domain(config.seriesKeys)
      .range(['#1d70b8', '#f47738']) // blue and orange

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      // eslint-disable-next-line no-undef
      .call(d3.axisBottom(x0))

    // eslint-disable-next-line no-undef
    g.append('g').call(d3.axisLeft(y).ticks(5))

    const category = g
      .selectAll('.category')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'category')
      .attr('transform', (d) => `translate(${x0(d[config.categoryKey])},0)`)

    category
      .selectAll('rect')
      .data((d) => config.seriesKeys.map((k) => ({ key: k, value: d[k] })))
      .enter()
      .append('rect')
      .attr('x', (d) => x1(d.key))
      .attr('y', (d) => y(d.value))
      .attr('width', x1.bandwidth())
      .attr('height', (d) => innerHeight - y(d.value))
      .attr('fill', (d) => colour(d.key))

    const legend = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${height - 15})`)

    config.seriesKeys.forEach((k, i) => {
      const xPos = i * 120
      legend
        .append('rect')
        .attr('x', xPos)
        .attr('y', -10)
        .attr('width', 12)
        .attr('height', 12)
        .attr('fill', colour(k))
      legend
        .append('text')
        .attr('x', xPos + 18)
        .attr('y', 0)
        .attr('class', 'govuk-body-s')
        .text(k)
    })
  }

  const directionData = [
    { year: '2019', On: 260, Off: 310 },
    { year: '2020', On: 240, Off: 295 },
    { year: '2021', On: 310, Off: 360 },
    { year: '2022', On: 305, Off: 360 },
    { year: '2023', On: 334, Off: 451 }
  ]

  renderGroupedBarChart('#chart-moves-direction', directionData, {
    categoryKey: 'year',
    seriesKeys: ['On', 'Off']
  })

  const speciesData = [
    { species: 'Sheep', On: 1100, Off: 1200 },
    { species: 'Cattle', On: 650, Off: 750 },
    { species: 'Goats', On: 120, Off: 180 }
  ]

  renderGroupedBarChart('#chart-moves-species', speciesData, {
    categoryKey: 'species',
    seriesKeys: ['On', 'Off']
  })
})
