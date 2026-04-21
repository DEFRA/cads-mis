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
import { downloadForm } from '../../server/common/components/downloadForm/download-form.js'

createAll(Button)
createAll(Checkboxes)
createAll(ErrorSummary)
createAll(Header)
createAll(Radios)
createAll(SkipLink)

const pickers = document.querySelectorAll('[data-module="year-month-picker"]')
pickers.forEach(yearMonthPicker)

const downloadForms = document.querySelectorAll('.js-download-form')
downloadForms.forEach(downloadForm)
