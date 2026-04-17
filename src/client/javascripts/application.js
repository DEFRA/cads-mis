import {
  createAll,
  Button,
  Checkboxes,
  ErrorSummary,
  Header,
  Radios,
  SkipLink
} from 'govuk-frontend'

import { yearMonthPicker } from '../../server/common/components/yearMonthPicker/year-month-picker.js'

createAll(Button)
createAll(Checkboxes)
createAll(ErrorSummary)
createAll(Header)
createAll(Radios)
createAll(SkipLink)

// Initialise year-month-picker components
const pickers = document.querySelectorAll('[data-module="year-month-picker"]')
pickers.forEach(yearMonthPicker)
