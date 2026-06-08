import { renderComponent } from '../../../../../tests/helpers/component-helpers.js'

describe('Report Item Component', () => {
  let $item

  const report = {
    reportKey: 'holding_summary',
    title: 'Holding summary',
    description: 'Holding summary report description'
  }

  beforeEach(() => {
    $item = renderComponent('report-item', report)
  })

  test('Should render report item component', () => {
    expect($item('[data-testid="report-item"]')).toHaveLength(1)
  })

  test('Should render the correct title', () => {
    expect($item('[data-testid="report-item-title"]').text().trim()).toBe(
      'Holding summary'
    )
  })

  test('Should render the correct description', () => {
    expect($item('[data-testid="report-item-description"]').text().trim()).toBe(
      'Holding summary report description'
    )
  })

  test('Should link to the correct report URL', () => {
    const href = $item('a.portal-card-link').attr('href')
    expect(href).toBe('../report/holding_summary')
  })
})
