//
//  SKProductExtension.swift
//  channel
//
//  Created by Michael Kalygin on 29/04/16.
//  Copyright © 2016 caffeinelabs. All rights reserved.
//

import Foundation
import StoreKit

// NOTE: https://bendodson.com/weblog/2014/12/10/skproduct-localized-price-in-swift/
extension SKProduct {
  func localizedPrice() -> String {
    let formatter = NSNumberFormatter()
    formatter.numberStyle = .CurrencyStyle
    formatter.locale = self.priceLocale
    return formatter.stringFromNumber(self.price)!
  }
}