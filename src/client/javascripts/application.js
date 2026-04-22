/* istanbul ignore file */

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
import { initModule } from '../../server/common/helpers/init.js'

createAll(Button)
createAll(Checkboxes)
createAll(ErrorSummary)
createAll(Header)
createAll(Radios)
createAll(SkipLink)

initModule('year-month-picker', yearMonthPicker)
initModule('download-form', downloadForm)
