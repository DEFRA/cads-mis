import { statusCodes } from '../../constants/status-codes.js'
/**
 * Returns all interactive form controls within the form (selects, radios,
 * checkboxes) excluding the submit button itself.
 */
function getFormControls(form) {
  return Array.from(
    form.querySelectorAll('select, input[type="radio"], input[type="checkbox"]')
  )
}

/**
 * Returns a user-facing error message based on the HTTP status code.
 * @param {number} status
 * @returns {string}
 */
function getErrorMessage(status) {
  if (status >= statusCodes.internalServerError) {
    return 'The report could not be downloaded. Try again later.'
  }
  return 'There was a problem with your request. Check your selections and try again.'
}

/**
 * Extracts the filename from a Content-Disposition header value, falling back
 * to a generated name from the report type.
 * @param {string} disposition
 * @param {string} reportType
 * @returns {string}
 */
function extractFilename(disposition, reportType) {
  const match = disposition.match(/filename="?([^"]+)"?/)
  return match ? match[1] : `report.${reportType || 'xlsx'}`
}

/**
 * Re-enables form controls and the submit button, then surfaces the error
 * message in the error summary.
 */
function handleError(controls, button, errorSummary, errorMessage, error) {
  controls.forEach((control) => {
    control.disabled = false
  })

  button.disabled = false
  button.removeAttribute('aria-disabled')

  if (errorSummary && errorMessage) {
    errorMessage.textContent =
      error.message || 'Something went wrong. Try again later.'
    errorSummary.hidden = false
    errorSummary.focus()
  }
}

/**
 * Initialises async file download behaviour on forms with the
 * `js-download-form` class. Disables the submit button and form controls
 * during the request, displays a GOV.UK error summary on failure, and shows
 * a success banner with a "Request another report" link on success.
 */
function downloadForm(form) {
  if (!form) {
    return
  }

  const button = form.querySelector('.js-download-button')
  const errorSummary = document.querySelector('.js-download-error')
  const errorMessage = document.querySelector('.js-download-error-message')
  const successBanner = document.querySelector('.js-download-success')
  const downloadUrl = form.dataset.downloadUrl

  if (!button || !downloadUrl) {
    return
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault()

    const controls = getFormControls(form)

    // Hide any previous error or success banner
    if (errorSummary) {
      errorSummary.hidden = true
    }
    if (successBanner) {
      successBanner.hidden = true
    }

    // Disable button and form controls
    button.disabled = true
    button.setAttribute('aria-disabled', 'true')

    const formData = new FormData(form)
    const payload = Object.fromEntries(formData.entries())

    controls.forEach((control) => {
      control.disabled = true
    })

    try {
      const response = await fetch(downloadUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(getErrorMessage(response.status))
      }

      const disposition = response.headers.get('Content-Disposition') || ''
      const filename = extractFilename(disposition, payload.reportType)

      // Trigger browser download
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = filename
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)

      // Show success banner and hide button; controls remain disabled
      if (successBanner) {
        successBanner.hidden = false
        successBanner.focus()
      }
      button.hidden = true
    } catch (error) {
      handleError(controls, button, errorSummary, errorMessage, error)
    }
  })
}

export {
  downloadForm,
  getFormControls,
  getErrorMessage,
  extractFilename,
  handleError
}
