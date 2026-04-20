import Boom from '@hapi/boom'

export const downloadController = {
  handler: async (request, h) => {
    const reportName = request.params.reportName
    const year = request.query.year
    const month = request.query.month
    const reportType = request.query.reportType

    if (!reportName || !year || !month || !reportType) {
      return Boom.badRequest(
        'Missing required parameters: reportName, year, month, and reportType are all required'
      )
    }

    const validReportTypes = ['csv', 'xlsx']
    if (!validReportTypes.includes(reportType)) {
      return Boom.badRequest(
        `Invalid reportType: must be one of ${validReportTypes.join(', ')}`
      )
    }

    const reportTypeExtension = reportType === 'xlsx' ? 'xlsx' : 'csv'

    return h.file('test.csv', {
      filename: `${reportName}_${year}-${month}.${reportTypeExtension}`,
      mode: 'attachment'
    })
  }
}
