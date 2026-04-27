import Boom from '@hapi/boom'
import {
  downloadCattleRegistrations,
  downloadCattleDeaths
} from '../common/clients/requests/mibff/download-reports.js'
import { reportNames } from '../common/constants/report-names.js'

const validReportTypes = ['csv', 'xlsx']

const contentTypes = {
  csv: 'text/csv',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
}

export const downloadController = {
  handler: async (request, h) => {
    const reportName = request.params.reportName
    const { year, month: rawMonth, reportType } = request.payload ?? {}
    const month = rawMonth ? String(rawMonth).padStart(2, '0') : rawMonth

    if (!reportName || !year || !month || !reportType) {
      return Boom.badRequest(
        'Missing required parameters: reportName, year, month, and reportType are all required'
      )
    }

    if (!validReportTypes.includes(reportType)) {
      return Boom.badRequest(
        `Invalid reportType: must be one of ${validReportTypes.join(', ')}`
      )
    }

    const reportFunction =
      reportName === reportNames.gbCattleDeaths
        ? downloadCattleDeaths
        : downloadCattleRegistrations

    const backendResponse = await reportFunction(request, {
      month,
      year,
      reportType
    })

    const extension = reportType === 'xlsx' ? 'xlsx' : 'csv'
    const filename = `${reportName}_${year}-${month}.${extension}`
    const buffer = Buffer.from(await backendResponse.arrayBuffer())

    return h
      .response(buffer)
      .type(contentTypes[reportType])
      .header('Content-Disposition', `attachment; filename="${filename}"`)
  }
}
