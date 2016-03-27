navRoutes = [
  new NavRoute('edit', 'fa-edit', { label: 'Edit', template: 'editPage' })
  new NavRoute('assets', 'fa-image', { label: 'Assets', template: 'assetsPage' })
  new NavRoute('import', 'fa-download', { label: 'Import', template: 'importPage' })
  new NavRoute('content', 'fa-television', { label: 'Content', template: 'contentPage' })
  new NavRoute('analytics', 'fa-line-chart', { label: 'Analytics', template: 'analyticsPage' })
]

navRouteList = new NavRouteList(navRoutes)

Session.set('navRoots', navRouteList.rootNavRoutes)
