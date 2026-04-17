const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

function yearMonthPicker(module) {
  if (!module) {
    return
  }

  const startYear = parseInt(module.dataset.startYear)
  const now = new Date()
  const endMonth = now.getMonth() + 1
  // If it's January, use the previous year
  const endYear = endMonth === 1 ? now.getFullYear() - 1 : now.getFullYear()

  const yearSelect = module.querySelector('select[id$="year"]')
  const monthSelect = module.querySelector('select[id$="month"]')

  if (!yearSelect || !monthSelect) {
    return
  }

  // Populate years (descending)
  for (let year = endYear; year >= startYear; year--) {
    const option = document.createElement('option')
    option.value = year
    option.textContent = year
    yearSelect.appendChild(option)
  }

  // Update months when year changes
  let previousYear = parseInt(yearSelect.value)
  yearSelect.addEventListener('change', function () {
    const oldYear = previousYear
    const newYear = parseInt(this.value)
    previousYear = newYear
    updateMonths(newYear, oldYear)
  })

  // Initial population
  updateMonths(endYear)

  function updateMonths(selectedYear, previousYear) {
    const currentYear = now.getFullYear()
    if (
      selectedYear !== currentYear &&
      previousYear != null &&
      previousYear !== currentYear
    ) {
      // change between previous years so no need to update months
      return
    }

    // Determine the max month for the selected year
    let maxMonth = 12
    if (selectedYear === currentYear) {
      maxMonth = endMonth - 1
    }

    // Clear and repopulate
    let selectedMonth = parseInt(monthSelect.value)
    if (isNaN(selectedMonth) || selectedMonth > maxMonth) {
      selectedMonth = maxMonth
    }
    monthSelect.innerHTML = ''
    for (let m = maxMonth; m >= 1; m--) {
      const option = document.createElement('option')
      option.value = m
      option.textContent = monthNames[m - 1]
      monthSelect.appendChild(option)
    }
    monthSelect.value = selectedMonth // Retain the selected month or most recent month
  }
}

export { yearMonthPicker }
