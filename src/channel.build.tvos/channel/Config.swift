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
  static let baseURL = Config.getKey("TV Base URL") as! String
  static let bootURL = Config.getKey("TV Boot URL") as! String
  
  private static func getKey(key: String) -> AnyObject? {
    return NSBundle.mainBundle().objectForInfoDictionaryKey(key)
  }
}