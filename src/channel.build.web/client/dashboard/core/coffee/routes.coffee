###
List of Dashboard routes.
(route name, fontawesome icon, options)
NOTE: https://github.com/lmaccherone/sb-admin-2-meteor
###

navRoutes = [
  new NavRoute('edit',           'fa-edit',        { label: 'Edit',           template: 'editPage' })
  new NavRoute('assets',         'fa-image',       { label: 'Assets',         template: 'assetsPage' })
  new NavRoute('import',         'fa-download',    { label: 'Import',         template: 'importPage' })
  new NavRoute('content',        'fa-television',  { label: 'Content',        template: 'contentPage' })
  new NavRoute('advertisements', 'fa-bullhorn',    { label: 'Advertisements', template: 'advertisementsPage' })
  new NavRoute('analytics',      'fa-line-chart',  { label: 'Analytics',      template: 'analyticsPage' })
  new NavRoute('billing',        'fa-credit-card', { label: 'Billing',        template: 'billingPage' })
]

navRouteList = new NavRouteList(navRoutes)

Session.set('navRoots', navRouteList.rootNavRoutes)
