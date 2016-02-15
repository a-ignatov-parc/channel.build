//
//  AppDelegate.swift
//  channel
//
//  Created by Michael Kalygin on 15/02/16.
//  Copyright © 2016 caffeinelabs. All rights reserved.
//

import UIKit
import TVMLKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, TVApplicationControllerDelegate {

  var window: UIWindow?
  var appController: TVApplicationController?

  func application(application: UIApplication, didFinishLaunchingWithOptions launchOptions: [NSObject: AnyObject]?) -> Bool {
    // Initialize fullscreen window.
    window = UIWindow(frame: UIScreen.mainScreen().bounds)
    
    // Initialize an app controller context (stores options for JS app and URL to JS main app file).
    let appControllerContext = TVApplicationControllerContext()
    
    // Safely get URL of JS main app file.
    guard let javaScriptURL = NSURL(string: Config.bootURL) else {
      fatalError("Unable to create NSURL!")
    }
    
    // Initialize settings for the app controller context.
    appControllerContext.javaScriptApplicationURL = javaScriptURL
    appControllerContext.launchOptions["baseURL"] = Config.baseURL
    
    // Create an app controller.
    appController = TVApplicationController(context: appControllerContext, window: window, delegate: self)
    
    return true
  }
}

