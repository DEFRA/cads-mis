import { renderComponent } from '../../../../../tests/helpers/component-helpers.js'

describe('#yearMonthPicker template', () => {
  test('Should render with data-module attribute', () => {
    const $ = renderComponent('yearMonthPicker', {
      startYear: 2023
    })

    const picker = $('[data-module="year-month-picker"]')
    expect(picker).toHaveLength(1)
    expect(picker.attr('data-start-year')).toBe('2023')
  })

  test('Should render year and month select elements', () => {
    const $ = renderComponent('yearMonthPicker', {
      startYear: 2023
    })

    expect($('select#year')).toHaveLength(1)
    expect($('select#month')).toHaveLength(1)
  })

  test('Should render with correct name attributes', () => {
    const $ = renderComponent('yearMonthPicker', {
      startYear: 2024
    })

    expect($('select[name="year"]')).toHaveLength(1)
    expect($('select[name="month"]')).toHaveLength(1)
  })
})
