navRoutes = [
  new NavRoute('tvapp', 'fa-television', { label: 'TV App' })
  new NavRoute('analytics', 'fa-line-chart', { label: 'Analytics' })
]

navRouteList = new NavRouteList(navRoutes)

Session.set('navRoots', navRouteList.rootNavRoutes)
