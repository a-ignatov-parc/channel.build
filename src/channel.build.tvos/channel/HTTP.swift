//
//  HTTP.swift
//  channel
//
//  Created by Michael Kalygin on 02/05/16.
//  Copyright © 2016 caffeinelabs. All rights reserved.
//

import Foundation


// Exposes helper HTTP requests methods for JSON APIs.
// Automatically parses JSON and returns result in completeion callback.
class HTTP {
  static let instance = HTTP()
  private init() {}
  
  typealias JSONResponseHandler = (AnyObject?, NSError?) -> Void
  
  enum HTTPMethod: String {
    case GET
  }
  
  class func get(url: NSURL, completion: JSONResponseHandler? = nil) {
    let request = NSMutableURLRequest(URL: url)
    let session = NSURLSession.sharedSession()

    request.HTTPMethod = HTTPMethod.GET.rawValue
    
    let task = session.dataTaskWithRequest(request) { data, response, error in
      guard let data = data, json = JSON.fromNSData(data) else {
        completion?(nil, error)
        return
      }
      
      completion?(json, error)
    }
    
    task.resume()
  }
  
  class func get(url: String, completion: JSONResponseHandler? = nil) {
    guard let url = NSURL(string: url) else {
      fatalError("Unable to create NSURL!")
    }
    self.get(url, completion: completion)
  }
}