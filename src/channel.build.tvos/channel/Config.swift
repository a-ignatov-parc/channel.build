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
  static let deviceID          = UIDevice.currentDevice().identifierForVendor!.UUIDString
  static let channelName       = Config.getKey("CFBundleName") as! String
  static let channelID         = Config.getKey("Channel ID") as! String
  static let TVJSClientVersion = Config.getClientVersion()
  static let TVJSClientURL     = Config.getKeyWithSub("TVJS Client URL", target: "%N", sub: TVJSClientVersion)
  static let TVJSAppURL        = Config.getKeyWithSub("TVJS App URL", target: "%N", sub: TVJSClientVersion)
  static let webAPIURL         = Config.getKey("Web API URL") as! String
  
  private static func getKey(key: String) -> AnyObject? {
    return NSBundle.mainBundle().objectForInfoDictionaryKey(key)
  }
  
  private static func getClientVersion() -> String {
    let getChannelsURL = "\(Config.webAPIURL)admin"
    let semaphore = dispatch_semaphore_create(0)
    var version = "1"
    
    HTTP.get(getChannelsURL) { data, error in
      guard let channels = data as? [[String: AnyObject]],
                i = channels.indexOf({ $0["_id"] as? String == Config.channelID }),
                clientVersion = channels[i]["clientVersion"] as? String else {
        print("Unable to retrieve version from \(getChannelsURL)")
        dispatch_semaphore_signal(semaphore)
        return
      }

      version = clientVersion
      dispatch_semaphore_signal(semaphore)
    }
    
    dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER)
    return version
  }
  
  private static func getKeyWithSub(key: String, target: String, sub: String) -> String {
    let prop = Config.getKey(key) as! String
    return prop.stringByReplacingOccurrencesOfString(target, withString: sub)
  }
}