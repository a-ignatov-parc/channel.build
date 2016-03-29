Template.chartUniqueUsers.onCreated(() ->
  appId = Session.get('appId')
  this.subscribe('analytics', appId)
)

Template.chartUniqueUsers.onRendered(() ->
  this.autorun(() ->
    appId = Session.get('appId')
    if appId? && Template.instance().subscriptionsReady()
      # Get launch analytics for the last 30 days.
      analytics = Analytics.find(
        appId: appId,
        operation: 'launch',
        createdAt:
          $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ).fetch().map((a) ->
        d = a.createdAt
        return id: a.deviceId, date: Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
      )

      # Group by date, remove duplicate launches and count launches.
      data = _.pairs(_.groupBy(analytics, 'date'), (g) ->
        return _.uniq(g, (a) ->
          return a.id
        )
      ).map((p) ->
        p[1] = _.uniq(p[1], (a) ->
          return a.id
        ).length
        return p
      )

      options =
        series:
          stack: 0
          lines:
            show: false
            steps: false
          bars:
            show: true
            barWidth: 0.8 * 24 * 60 * 60 * 1000
            align: 'center'
            lineWidth: 1.0
        xaxis:
          mode: 'time'
          autoscaleMargin: 0.05
        yaxis:
          autoscaleMargin: 0.05
        grid:
          tickColor: '#EEEEEE'
          borderWidth: 0
          margin: 10

      Tracker.afterFlush(() ->
        $chart = $('.chart-unique-users')
        if data.length > 0
          $.plot($chart, [data], options)
        else
          $chart.text('Analytics data is not available yet.')
      )
  )
)
