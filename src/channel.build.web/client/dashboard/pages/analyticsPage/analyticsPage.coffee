Template.analyticsPage.onCreated(() ->
  appId = Session.get('appId')
  this.subscribe('analytics', appId)
)

Template.chartUniqueUsers.onRendered(() ->
  this.autorun(() ->
    appId = Session.get('appId')
    if appId? && Template.instance().subscriptionsReady()
      # Get launch analytics for the last 30 days.
      now = new Date()
      nowYmd = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
      analytics = Analytics.find(
        appId: appId,
        operation: 'launch',
        createdAt:
          $gte: new Date(nowYmd - 30 * 24 * 60 * 60 * 1000)
      ).fetch().map((a) ->
        date = a.createdAt
        dateYmd = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
        return {
          id: a.deviceId,
          date: dateYmd
        }
      )

      # Group by date, remove duplicate launches and count launches.
      data = _.pairs(_.groupBy(analytics, 'date'))
        .map((p) ->
          p[1] = _.uniq(p[1], (a) ->
            return a.id
          ).length
          return p
        )

      options =
        series:
          stack: false
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

Template.chartVideoViews.onRendered(() ->
  this.autorun(() ->
    appId = Session.get('appId')
    if appId? && Template.instance().subscriptionsReady()
      # Get video play analytics for the last 30 days.
      now = new Date()
      nowYmd = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
      analytics = Analytics.find(
        appId: appId,
        operation: 'play',
        createdAt:
          $gte: new Date(nowYmd - 30 * 24 * 60 * 60 * 1000)
      ).fetch().map((a) ->
        date = a.createdAt
        dateYmd = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
        return {
          id: a.deviceId,
          target: a.target,
          date: dateYmd
        }
      )

      # Group by date, remove duplicates.
      data = _.pairs(_.groupBy(analytics, 'date'))
        .map((p) ->
          p[1] = _.uniq(p[1], (a) ->
            return "#{a.id}+#{a.target}"
          ).length
          return p
        )

      options =
        series:
          stack: false
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
        $chart = $('.chart-video-views')
        if data.length > 0
          $.plot($chart, [data], options)
        else
          $chart.text('Analytics data is not available yet.')
      )
  )
)
