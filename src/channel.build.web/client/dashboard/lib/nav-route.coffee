DEFAULT_MAIN_LAYOUT = 'dashboardPage'

class NavRoute
  constructor: (@name, @icon, @config) ->
    unless @name?
      throw new Error('Must provide a name for each NavRoute')
    unless @config?
      @config = {}
    {@template, @isMainNav, @label, @path, @parentName, @layoutTemplate, @redirect} = @config
    unless @template?
      @template = @name
    unless @isMainNav?
      @isMainNav = true
    unless @label?
      if @redirect?
        @label = @redirect.substr(0, 1).toUpperCase() + @redirect.substr(1)
      else
        @label = @name.substr(0, 1).toUpperCase() + @name.substr(1)
    unless @path?
      @path = '/dashboard/' + @name
    unless @icon?
      @icon = null
    unless @layoutTemplate?
      @layoutTemplate = DEFAULT_MAIN_LAYOUT

class NavRouteList
  constructor: (navRoutes) ->
    @routes = []
    @routeIndex = {}
    @rootNavRoutes = []
    @redirects = []
    for route in navRoutes
      @addRoute(route)
    @setRouter()

  addRoute: (route) ->
    if @routeIndex.hasOwnProperty(route.name)
      throw new Error('Route names must be unique')
    if route.parentName? and not route.isMainNav
      throw new Error('Children nav nodes must set isMainNav to true.')
    unless route.children?
      route.children = []
    if route.parentName?
      parentRoute = @getRoute(route.parentName)
      unless parentRoute.isMainNav
        throw new Error('Parent nav nodes must set isMainNav to true.')
      route.path = parentRoute.path + route.path
      parentRoute.children.push(route)
    else
      if route.isMainNav
        @rootNavRoutes.push(route)
    @routes.push(route)
    @routeIndex[route.name] = route

  getRoute: (name) ->
    return @routeIndex[name]

  setRouter: (layoutTemplate = DEFAULT_MAIN_LAYOUT, redirectTemplate = 'loading', notFoundTemplate = '404') ->
    # assume that first route is default one
    defaultRoute = @routes[0]
    Router.route('/dashboard',
      action: () ->
        this.layout('dashboardPage')
        this.redirect(defaultRoute.path)
      waitOn: () ->
        Accounts.loginServicesConfigured()
    )

    # set regular routes
    for r in @routes
      if r.redirect?
        Router.route(r.path,
          action: () ->
            this.redirect(r.redirect)
          waitOn: () ->
            Accounts.loginServicesConfigured()
        )
      else
        Router.route(r.path, r)
    Router.onAfterAction(() ->
      Session.set('active', @route.getName())
    )

this.NavRoute = NavRoute
this.NavRouteList = NavRouteList
