/**
 * Initialises async file download behaviour on forms with the
 * `js-download-form` class. Disables the submit button during the
 * request and displays a GOV.UK error summary on failure.
 */
function downloadForm(form) {
  if (!form) {
    return
  }

  const button = form.querySelector('.js-download-button')
  const errorSummary = document.querySelector('.js-download-error')
  const errorMessage = document.querySelector('.js-download-error-message')
  const downloadUrl = form.dataset.downloadUrl

  if (!button || !downloadUrl) {
    return
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault()

    // Hide any previous error
    if (errorSummary) {
      errorSummary.hidden = true
    }

    // Disable button
    button.disabled = true
    button.setAttribute('aria-disabled', 'true')

    const formData = new FormData(form)
    const payload = Object.fromEntries(formData.entries())

    try {
      const response = await fetch(downloadUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const message =
          response.status >= 500
            ? 'The report could not be downloaded. Try again later.'
            : 'There was a problem with your request. Check your selections and try again.'
        throw new Error(message)
      }

      // Extract filename from Content-Disposition header or build a fallback
      const disposition = response.headers.get('Content-Disposition') || ''
      const filenameMatch = disposition.match(/filename="?([^"]+)"?/)
      const filename = filenameMatch
        ? filenameMatch[1]
        : `report.${payload.reportType || 'xlsx'}`

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
    } catch (error) {
      if (errorSummary && errorMessage) {
        errorMessage.textContent =
          error.message || 'Something went wrong. Try again later.'
        errorSummary.hidden = false
        errorSummary.focus()
      }
    } finally {
      // Re-enable button
      button.disabled = false
      button.removeAttribute('aria-disabled')
    }
  })
}

export { downloadForm }
