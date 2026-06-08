// @vitest-environment jsdom

import { downloadForm, getFormControls } from './download-form.js'

/**
 * Build a minimal DOM matching the gb_cattle_registrations template structure
 * and return references to the key elements.
 */
function buildDom({
  withErrorSummary = true,
  withSuccessBanner = true,
  withButton = true,
  downloadUrl = '/download/gb-cattle-registrations'
} = {}) {
  document.body.innerHTML = ''

  if (withSuccessBanner) {
    const banner = document.createElement('div')
    banner.className =
      'govuk-notification-banner govuk-notification-banner--success js-download-success'
    banner.hidden = true
    banner.tabIndex = -1
    const content = document.createElement('div')
    content.className = 'govuk-notification-banner__content'
    const heading = document.createElement('h3')
    heading.className = 'govuk-notification-banner__heading'
    heading.textContent = 'Report successfully downloaded'
    const link = document.createElement('a')
    link.href = ''
    link.textContent = 'Request another report'
    content.appendChild(heading)
    content.appendChild(link)
    banner.appendChild(content)
    document.body.appendChild(banner)
  }

  if (withErrorSummary) {
    const summary = document.createElement('div')
    summary.className = 'govuk-error-summary js-download-error'
    summary.hidden = true
    summary.tabIndex = -1
    const msg = document.createElement('li')
    msg.className = 'js-download-error-message'
    summary.appendChild(msg)
    document.body.appendChild(summary)
  }

  const form = document.createElement('form')
  form.className = 'js-download-form'
  if (downloadUrl) {
    form.dataset.downloadUrl = downloadUrl
  }

  // Simulate year select
  const yearSelect = document.createElement('select')
  yearSelect.name = 'year'
  const yearOption = document.createElement('option')
  yearOption.value = '2026'
  yearOption.selected = true
  yearSelect.appendChild(yearOption)
  form.appendChild(yearSelect)

  // Simulate month select
  const monthSelect = document.createElement('select')
  monthSelect.name = 'month'
  const monthOption = document.createElement('option')
  monthOption.value = '03'
  monthOption.selected = true
  monthSelect.appendChild(monthOption)
  form.appendChild(monthSelect)

  // Simulate radio buttons
  const radio1 = document.createElement('input')
  radio1.type = 'radio'
  radio1.name = 'reportType'
  radio1.value = 'xlsx'
  radio1.checked = true
  form.appendChild(radio1)

  const radio2 = document.createElement('input')
  radio2.type = 'radio'
  radio2.name = 'reportType'
  radio2.value = 'csv'
  form.appendChild(radio2)

  if (withButton) {
    const button = document.createElement('button')
    button.className = 'js-download-button'
    button.type = 'submit'
    button.textContent = 'Download'
    form.appendChild(button)
  }

  document.body.appendChild(form)

  return {
    form,
    button: form.querySelector('.js-download-button'),
    yearSelect,
    monthSelect,
    radio1,
    radio2,
    errorSummary: document.querySelector('.js-download-error'),
    errorMessage: document.querySelector('.js-download-error-message'),
    successBanner: document.querySelector('.js-download-success')
  }
}

function makeOkResponse(
  blob = new Blob(['data'], { type: 'text/csv' }),
  filename = 'report_2026-03.csv'
) {
  return {
    ok: true,
    status: 200,
    headers: {
      get: (name) =>
        name === 'Content-Disposition'
          ? `attachment; filename="${filename}"`
          : null
    },
    blob: () => Promise.resolve(blob)
  }
}

function makeErrorResponse(status = 500) {
  return {
    ok: false,
    status,
    headers: { get: () => null },
    blob: () => Promise.resolve(new Blob())
  }
}

async function submitForm(form) {
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
  // Flush microtasks
  await new Promise((resolve) => setTimeout(resolve, 0))
}

// Stub browser APIs not available in jsdom
let mockFetch

beforeAll(() => {
  global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
  global.URL.revokeObjectURL = vi.fn()
  mockFetch = vi.fn()
  vi.stubGlobal('fetch', mockFetch)
})

afterAll(() => {
  vi.unstubAllGlobals()
})

beforeEach(() => {
  mockFetch.mockReset()
})

describe('getFormControls', () => {
  test('returns selects, radios, and checkboxes but not the submit button', () => {
    const { form } = buildDom()
    const controls = getFormControls(form)
    expect(controls).toHaveLength(4) // 2 selects + 2 radios
    expect(controls.every((c) => c.type !== 'submit')).toBe(true)
  })
})

describe('downloadForm', () => {
  describe('early-return guards', () => {
    test('does nothing when called with no argument', () => {
      expect(() => downloadForm(null)).not.toThrow()
      expect(() => downloadForm(undefined)).not.toThrow()
    })

    test('does nothing when button is missing', () => {
      const { form } = buildDom({ withButton: false })
      expect(() => downloadForm(form)).not.toThrow()
    })

    test('does nothing when data-download-url is missing', () => {
      const { form } = buildDom({ downloadUrl: null })
      expect(() => downloadForm(form)).not.toThrow()
    })
  })

  describe('on submit', () => {
    test('disables selects and radio inputs during the request', async () => {
      const { form, yearSelect, monthSelect, radio1, radio2 } = buildDom()

      let capturedDisabledState
      mockFetch.mockImplementation(async () => {
        capturedDisabledState = {
          year: yearSelect.disabled,
          month: monthSelect.disabled,
          radio1: radio1.disabled,
          radio2: radio2.disabled
        }
        return makeOkResponse()
      })
      downloadForm(form)
      await submitForm(form)

      expect(capturedDisabledState).toEqual({
        year: true,
        month: true,
        radio1: true,
        radio2: true
      })
    })

    test('disables the submit button during the request', async () => {
      const { form, button } = buildDom()

      let buttonWasDisabled = false
      mockFetch.mockImplementation(async () => {
        buttonWasDisabled = button.disabled
        return makeOkResponse()
      })
      downloadForm(form)
      await submitForm(form)

      expect(buttonWasDisabled).toBe(true)
    })

    test('hides any visible error summary before submitting', async () => {
      const { form, errorSummary } = buildDom()
      errorSummary.hidden = false
      fetch.mockResolvedValue(makeOkResponse())
      downloadForm(form)
      await submitForm(form)
      // after fetch resolves, error summary should remain hidden
      expect(errorSummary.hidden).toBe(true)
    })

    test('hides any visible success banner before submitting', async () => {
      const { form, successBanner } = buildDom()
      successBanner.hidden = false
      fetch.mockResolvedValue(makeOkResponse())
      downloadForm(form)
      await submitForm(form)
      // success banner hidden then re-shown after success — overall it should be visible after success
      expect(successBanner.hidden).toBe(false)
    })
  })

  describe('on successful download', () => {
    test('shows the success banner', async () => {
      const { form, successBanner } = buildDom()
      fetch.mockResolvedValue(makeOkResponse())
      downloadForm(form)
      await submitForm(form)
      expect(successBanner.hidden).toBe(false)
    })

    test('hides the submit button', async () => {
      const { form, button } = buildDom()
      fetch.mockResolvedValue(makeOkResponse())
      downloadForm(form)
      await submitForm(form)
      expect(button.hidden).toBe(true)
    })

    test('keeps form controls disabled', async () => {
      const { form, yearSelect, monthSelect, radio1, radio2 } = buildDom()
      fetch.mockResolvedValue(makeOkResponse())
      downloadForm(form)
      await submitForm(form)
      expect(yearSelect.disabled).toBe(true)
      expect(monthSelect.disabled).toBe(true)
      expect(radio1.disabled).toBe(true)
      expect(radio2.disabled).toBe(true)
    })

    test('triggers an anchor download with the correct filename', async () => {
      const { form } = buildDom()
      fetch.mockResolvedValue(
        makeOkResponse(new Blob(['data']), 'my-report.csv')
      )
      downloadForm(form)

      const appendSpy = vi.spyOn(document.body, 'appendChild')
      await submitForm(form)

      const anchor = appendSpy.mock.calls
        .map((call) => call[0])
        .find((el) => el.tagName === 'A')

      expect(anchor).toBeDefined()
      expect(anchor.download).toBe('my-report.csv')
    })

    test('falls back to reportType extension when Content-Disposition is absent', async () => {
      const { form } = buildDom()
      fetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => null },
        blob: () => Promise.resolve(new Blob(['data']))
      })
      downloadForm(form)

      const appendSpy = vi.spyOn(document.body, 'appendChild')
      await submitForm(form)

      const anchor = appendSpy.mock.calls
        .map((call) => call[0])
        .find((el) => el.tagName === 'A')

      expect(anchor.download).toBe('report.xlsx')
    })

    test('works without a success banner in the DOM', async () => {
      const { form } = buildDom({ withSuccessBanner: false })
      fetch.mockResolvedValue(makeOkResponse())
      downloadForm(form)
      await expect(submitForm(form)).resolves.not.toThrow()
    })
  })

  describe('on error response', () => {
    test('re-enables selects and radio inputs on 4xx error', async () => {
      const { form, yearSelect, monthSelect, radio1, radio2 } = buildDom()
      fetch.mockResolvedValue(makeErrorResponse(400))
      downloadForm(form)
      await submitForm(form)
      expect(yearSelect.disabled).toBe(false)
      expect(monthSelect.disabled).toBe(false)
      expect(radio1.disabled).toBe(false)
      expect(radio2.disabled).toBe(false)
    })

    test('re-enables selects and radio inputs on 5xx error', async () => {
      const { form, yearSelect, monthSelect, radio1, radio2 } = buildDom()
      fetch.mockResolvedValue(makeErrorResponse(500))
      downloadForm(form)
      await submitForm(form)
      expect(yearSelect.disabled).toBe(false)
      expect(monthSelect.disabled).toBe(false)
      expect(radio1.disabled).toBe(false)
      expect(radio2.disabled).toBe(false)
    })

    test('re-enables the submit button on error', async () => {
      const { form, button } = buildDom()
      fetch.mockResolvedValue(makeErrorResponse(500))
      downloadForm(form)
      await submitForm(form)
      expect(button.disabled).toBe(false)
      expect(button.getAttribute('aria-disabled')).toBeNull()
    })

    test('shows the error summary with a 5xx message', async () => {
      const { form, errorSummary, errorMessage } = buildDom()
      fetch.mockResolvedValue(makeErrorResponse(500))
      downloadForm(form)
      await submitForm(form)
      expect(errorSummary.hidden).toBe(false)
      expect(errorMessage.textContent).toBe(
        'The report could not be downloaded. Try again later.'
      )
    })

    test('shows the error summary with a 4xx message', async () => {
      const { form, errorSummary, errorMessage } = buildDom()
      fetch.mockResolvedValue(makeErrorResponse(400))
      downloadForm(form)
      await submitForm(form)
      expect(errorSummary.hidden).toBe(false)
      expect(errorMessage.textContent).toBe(
        'There was a problem with your request. Check your selections and try again.'
      )
    })

    test('shows error summary when fetch itself throws (network error)', async () => {
      const { form, errorSummary, errorMessage } = buildDom()
      fetch.mockRejectedValue(new Error('Network failure'))
      downloadForm(form)
      await submitForm(form)
      expect(errorSummary.hidden).toBe(false)
      expect(errorMessage.textContent).toBe('Network failure')
    })

    test('keeps the success banner hidden on error', async () => {
      const { form, successBanner } = buildDom()
      fetch.mockResolvedValue(makeErrorResponse(500))
      downloadForm(form)
      await submitForm(form)
      expect(successBanner.hidden).toBe(true)
    })

    test('works without an error summary in the DOM', async () => {
      const { form } = buildDom({ withErrorSummary: false })
      fetch.mockResolvedValue(makeErrorResponse(500))
      downloadForm(form)
      await expect(submitForm(form)).resolves.not.toThrow()
    })
  })
})
