//
//  JSON.swift
//  channel
//
//  Created by Michael Kalygin on 02/05/16.
//  Copyright © 2016 caffeinelabs. All rights reserved.
//

import Foundation

class JSON {
  static let instance = JSON()
  private init() {}
  
  class func fromNSData(data: NSData) -> AnyObject? {
    do {
      return try NSJSONSerialization.JSONObjectWithData(data, options: .MutableContainers)
    } catch let error {
      print("JSON error:", error)
    }
    return nil
  }
  
  class func toNSData(json: AnyObject) -> NSData?{
    do {
      return try NSJSONSerialization.dataWithJSONObject(json, options: NSJSONWritingOptions.PrettyPrinted)
    } catch let error {
      print("JSON error:", error)
    }
    return nil
  }
}