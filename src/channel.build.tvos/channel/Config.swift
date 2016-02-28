//
//  Config.swift
//  channel
//
//  Created by Michael Kalygin on 15/02/16.
//  Copyright © 2016 caffeinelabs. All rights reserved.
//

import UIKit

// Helper structure to store app settings extracted from Info.plist.
// NOTE: Some of the settings are different for different Xcode build schemes.
struct Config {
  static let TVJSClientURL = Config.getKey("TVJS Client URL") as! String
  static let TVJSAppURL = Config.getKey("TVJS App URL") as! String
  static let webAPIURL = Config.getKey("Web API URL") as! String
  static let channelID = Config.getKey("Channel ID") as! String
  
  private static func getKey(key: String) -> AnyObject? {
    return NSBundle.mainBundle().objectForInfoDictionaryKey(key)
  }
}