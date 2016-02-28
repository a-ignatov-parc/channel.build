//
//  Config.swift
//  TravelwithKids
//
//  Created by Michael Kalygin on 15/02/16.
//  Copyright © 2016 caffeinelabs. All rights reserved.
//

import UIKit

// Helper structure to store app settings extracted from Info.plist.
// NOTE: Some of the settings are different for different Xcode build schemes.
struct Config {
  static let hostURL = Config.getKey("TV Host URL") as! String
  static let bootURL = Config.getKey("TV Boot URL") as! String
  static let APIURL = Config.getKey("TV API URL") as! String
  static let channelID = Config.getKey("TV Channel ID") as! String
  
  private static func getKey(key: String) -> AnyObject? {
    return NSBundle.mainBundle().objectForInfoDictionaryKey(key)
  }
}