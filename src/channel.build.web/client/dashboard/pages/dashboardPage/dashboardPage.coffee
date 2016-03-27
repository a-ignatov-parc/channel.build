Meteor.startup(() ->
  new ResizeSensor()

  $(window).bind("load resize", () ->
    topOffset = 50
    width = (if (@window.innerWidth > 0) then @window.innerWidth else @screen.width)
    if width < 768
      $("div.navbar-collapse").addClass("collapse")
      topOffset = 100
    else
      $("div.navbar-collapse").removeClass("collapse")
    height = (if (@window.innerHeight > 0) then @window.innerHeight else @screen.height)
    height = height - topOffset
    if height < 1
      height = 1
    if height > topOffset
      $("#page-wrapper").css("min-height", (height) + "px")
  )
)

Template.topbar.helpers(
  userName: () ->
    if Meteor.user() != null
      return Meteor.user().profile.givenName
    else
      return ""
)

Template.sidebar.helpers(
  navElements: () ->
    return Session.get('navRoots')
)

Template.sidebar.rendered = () ->
  $('#side-menu').metisMenu()

Template.navElement.helpers(
  isActive: () ->
    if this.name is Session.get('active')
      return "active"
    else
      return ""
)
