import Boom from '@hapi/boom'
import { downloadReport } from '../common/clients/requests/mibff/download-reports.js'

const validReportTypes = ['csv', 'xlsx']

const contentTypes = {
  csv: 'text/csv',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
}

export const downloadController = {
  handler: async (request, h) => {
    const reportKey = request.params.reportKey
    const { year, month: rawMonth, reportType } = request.payload ?? {}
    const month = rawMonth ? String(rawMonth).padStart(2, '0') : rawMonth

    if (!reportKey || !year || !month || !reportType) {
      return Boom.badRequest(
        'Missing required parameters: reportKey, year, month, and reportType are all required'
      )
    }

    if (!validReportTypes.includes(reportType)) {
      return Boom.badRequest(
        `Invalid reportType: must be one of ${validReportTypes.join(', ')}`
      )
    }

    const backendResponse = await downloadReport(request, reportKey, {
      month,
      year,
      reportType
    })

    const extension = reportType === 'xlsx' ? 'xlsx' : 'csv'
    const filename = `${reportKey}_${year}-${month}.${extension}`
    const buffer = Buffer.from(await backendResponse.arrayBuffer())

    return h
      .response(buffer)
      .type(contentTypes[reportType])
      .header('Content-Disposition', `attachment; filename="${filename}"`)
  }
}
