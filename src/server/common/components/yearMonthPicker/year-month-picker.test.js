import { JSDOM } from 'jsdom'
import { renderComponent } from '../../../../../tests/helpers/component-helpers.js'
import { yearMonthPicker } from './year-month-picker.js'

function createPickerModule(startYear) {
  const $ = renderComponent('yearMonthPicker', { startYear })
  const html = $.html()
  const dom = new JSDOM(html)
  global.document = dom.window.document
  global.window = dom.window

  return dom.window.document.querySelector('[data-module="year-month-picker"]')
}

describe('#yearMonthPicker', () => {
  let realDate

  beforeEach(() => {
    realDate = global.Date
  })

  afterEach(() => {
    global.Date = realDate
    delete global.document
    delete global.window
  })

  function mockDate(year, month, day) {
    global.Date = class extends realDate {
      constructor(...args) {
        if (args.length === 0) {
          super(year, month - 1, day)
        } else {
          super(...args)
        }
      }
    }
  }

  test('Should return early if module is null', () => {
    expect(() => yearMonthPicker(null)).not.toThrow()
  })

  describe('year population', () => {
    test('Should populate years from startYear to current year in descending order', () => {
      mockDate(2026, 4, 17)
      const module = createPickerModule(2023)

      yearMonthPicker(module)

      const yearSelect = module.querySelector('select#year')
      const options = Array.from(yearSelect.options)

      expect(options).toHaveLength(4)
      expect(options[0].value).toBe('2026')
      expect(options[1].value).toBe('2025')
      expect(options[2].value).toBe('2024')
      expect(options[3].value).toBe('2023')
    })

    test('Should use previous year as end year when current month is January', () => {
      mockDate(2026, 1, 15)
      const module = createPickerModule(2023)

      yearMonthPicker(module)

      const yearSelect = module.querySelector('select#year')
      const options = Array.from(yearSelect.options)

      expect(options[0].value).toBe('2025')
    })
  })

  describe('month population', () => {
    test('Should populate all 12 months for a previous year', () => {
      mockDate(2026, 4, 17)
      const module = createPickerModule(2023)

      yearMonthPicker(module)

      const yearSelect = module.querySelector('select#year')
      yearSelect.value = '2025'
      yearSelect.dispatchEvent(new global.window.Event('change'))

      const monthSelect = module.querySelector('select#month')
      const options = Array.from(monthSelect.options)

      expect(options).toHaveLength(12)
      expect(options[0].value).toBe('12')
      expect(options[0].textContent).toBe('December')
      expect(options[11].value).toBe('1')
      expect(options[11].textContent).toBe('January')
    })

    test('Should limit months to current month for current year', () => {
      mockDate(2026, 4, 17)
      const module = createPickerModule(2023)

      yearMonthPicker(module)

      const monthSelect = module.querySelector('select#month')
      const options = Array.from(monthSelect.options)

      expect(options).toHaveLength(3)
      expect(options[0].value).toBe('3')
      expect(options[0].textContent).toBe('March')
      expect(options[2].value).toBe('1')
      expect(options[2].textContent).toBe('January')
    })

    test('Should populate all months when current month is January', () => {
      mockDate(2026, 1, 15)
      const module = createPickerModule(2023)

      yearMonthPicker(module)

      const monthSelect = module.querySelector('select#month')
      const options = Array.from(monthSelect.options)

      expect(options).toHaveLength(12)
    })
  })

  describe('month retention on year change', () => {
    test('Should retain selected month when switching between previous years', () => {
      mockDate(2026, 4, 17)
      const module = createPickerModule(2023)

      yearMonthPicker(module)

      const yearSelect = module.querySelector('select#year')
      const monthSelect = module.querySelector('select#month')

      yearSelect.value = '2025'
      yearSelect.dispatchEvent(new global.window.Event('change'))
      monthSelect.value = '6'

      yearSelect.value = '2024'
      yearSelect.dispatchEvent(new global.window.Event('change'))

      expect(monthSelect.value).toBe('6')
    })

    test('Should adjust month down when switching to current year with fewer months', () => {
      mockDate(2026, 3, 17)
      const module = createPickerModule(2023)

      yearMonthPicker(module)

      const yearSelect = module.querySelector('select#year')
      const monthSelect = module.querySelector('select#month')

      yearSelect.value = '2025'
      yearSelect.dispatchEvent(new global.window.Event('change'))
      monthSelect.value = '10'

      yearSelect.value = '2026'
      yearSelect.dispatchEvent(new global.window.Event('change'))

      expect(parseInt(monthSelect.value)).toBeLessThanOrEqual(3)
    })
  })
})
