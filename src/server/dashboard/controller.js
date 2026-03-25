// import { fetchReportsList } from './fetchReportsList.js'

function reportItem(id, key, title, description) {
  return {
    reportId: id,
    reportKey: key,
    title,
    description,
    isActive: true
  }
}

function getMockReportData() {
  return [
    reportItem(
      'Holding',
      'dashboard_1',
      'Holding summary',
      'Summary of a single holding, including on/off movements, species and mapped holdings.'
    ),
    reportItem(
      'Animal',
      'dashboard_2',
      'Animal summary',
      'Movement history and mapped journey for an individual animal, including last known holding'
    ),
    reportItem(
      'Movements',
      'dashboard_3',
      'Movements (all holdings)',
      'High-level movement metrics including within-country and cross-border flows and detailed movement table.'
    ),
    reportItem(
      'Movement',
      'dashboard_4',
      'Movement summary (holding)',
      'On/off movement summaries for a holding, including direction and species charts and tables.'
    ),
    reportItem(
      'Journey',
      'dashboard_5',
      'Journey by haulier',
      'Journey-level view by vehicle and haulier, including load/unload summary and mapped holdings.'
    ),
    reportItem(
      'Zonal',
      'dashboard_6',
      'Zonal movements summary',
      'Into-zone, out-of-zone, within-zone, import and export summaries with mapped holdings in and around the zone.'
    ),
    reportItem(
      'Cohort',
      'dashboard_7',
      'Cohort tracing',
      'Cohort holdings, status summary and detailed animal/last-known holding data for a selected cohort animal.'
    ),
    reportItem(
      'Sheep',
      'dashboard_8',
      'Sheep and goat inspections',
      'Inspection-oriented view of holding movement history and animals in movement around inspection dates.'
    ),
    reportItem(
      'Unregistered',
      'dashboard_9',
      'Unregistered herds and flocks',
      'Data quality view of unregistered and archived herds/flocks, with related holding metrics.'
    ),
    reportItem(
      'Scrapie',
      'dashboard_10',
      'Scrapie flock scheme audit',
      'Compulsory Scrapie Flock Scheme audit, including holding details, movement history and off-move summary.'
    )
  ]
}

export const dashboardController = {
  async handler(_request, h) {
    //TODO
    // var reports = await fetchReportsList('') //session.idToken)
    const reports = getMockReportData()

    return h.view('dashboard/index', {
      pageTitle: 'Dashboard',
      heading: 'Dashboard',
      breadcrumbs: [
        {
          text: 'Home',
          href: '/'
        },
        {
          text: 'Dashboard'
        }
      ],
      viewModel: {
        reports
      }
    })
  }
}
