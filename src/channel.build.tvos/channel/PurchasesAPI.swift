//
//  PurchasesAPI.swift
//  channel
//
//  Created by Michael Kalygin on 21/04/16.
//  Copyright © 2016 caffeinelabs. All rights reserved.
//

import Foundation
import StoreKit
import JavaScriptCore

// Inherits from JSExport so that these methods may be exposed
// to JavaScript context on app start.
@objc protocol PurchasesAPIExport: JSExport {
  static func instance() -> PurchasesAPIExport
  @objc(purchaseProduct::) func purchaseProduct(productId: String, jsCallback: JSValue?)
  @objc(isProductPurchased:) func isProductPurchased(productId: String) -> Bool
  @objc(getLocalizedPrices::) func getLocalizedPrices(productIds: [String], jsCallback: JSValue?)
}

// Represents In-App Purchases API for JavaScript.
@objc class PurchasesAPI: NSObject, PurchasesAPIExport {
  let iCloudStore = NSUbiquitousKeyValueStore()
  var request: SKProductsRequest?
  var completion: (([SKProduct]?, NSError?) -> Void)?
  
  // JavaScript callback runs on both success and failure of API requests
  // if provided by a user of the API.
  // The callback has the following JavaScript signature:
  // function (response, error) { ... }.
  var jsCallback: JSValue?
  
  static func instance() -> PurchasesAPIExport {
    return PurchasesAPI()
  }
  
  override init() {
    super.init()
    self.iCloudStore.synchronize()
    SKPaymentQueue.defaultQueue().addTransactionObserver(self)
  }
  
  /**
   * Public API.
   */
  
  // Makes a product purchase by its ID.
  @objc(purchaseProduct::) func purchaseProduct(productId: String, jsCallback: JSValue?) {
    print("Purchasing product with ID \(productId)...")
    
    self.getProducts([productId], completion: { products, error in
      guard let product = products?.first else {
        print("Purchase error: \(error)")
        self.resetRequest(errorMessage: error?.localizedDescription)
        return
      }
      
      self.queuePayment(product)
    }, jsCallback: jsCallback)
  }
  
  // Checks whether a product has been bought by a user of the app.
  @objc(isProductPurchased:) func isProductPurchased(productId: String) -> Bool {
    return self.iCloudStore.boolForKey(productId)
  }
  
  // Gets localized prices for products with the given IDs.
  @objc(getLocalizedPrices::) func getLocalizedPrices(productIds: [String], jsCallback: JSValue?) {
    self.getProducts(productIds, completion: { products, error in
      if (products == nil) {
        print("Purchase error: \(error)")
        self.resetRequest(errorMessage: error?.localizedDescription)
        return
      }
      
      var prices = [String: String]()
      for product in products! {
        prices[product.productIdentifier] = product.localizedPrice()
      }

      self.resetRequest(prices)
    }, jsCallback: jsCallback)
  }
  
  /**
   * Private helper methods.
   */
  
  // Gets an array of SKProducts from an array of product IDs using StoreKit.
  private func getProducts(productIds: [String], completion: ([SKProduct]?, NSError?) -> Void, jsCallback: JSValue?) {
    guard self.request == nil else { return }
    
    print("Getting products information with IDs \(productIds)...")
    
    self.completion = completion
    self.jsCallback = jsCallback
    self.request = SKProductsRequest(productIdentifiers: Set(productIds))
    self.request?.delegate = self
    self.request?.start()
  }
  
  // Queues a payment transaction for a given SKProduct.
  private func queuePayment(product: SKProduct) {
    print("Queueing a payment transaction for product \(product)...")
    
    let payment = SKPayment(product: product)
    SKPaymentQueue.defaultQueue().addPayment(payment)
  }
  
  // Runs on product purchase success.
  private func onProductPurchaseSuccess(productId: String) {
    print("Purchase of product with ID \(productId) was successful!")
    
    self.iCloudStore.setBool(true, forKey: productId)
    self.iCloudStore.synchronize()
    
    self.resetRequest(productId)
  }
  
  // Runs on product purchase failure.
  private func onProductPurchaseFailure(errorMessage: String? = nil) {
    print("Purchase failed!")
    
    self.resetRequest(errorMessage: errorMessage)
  }
  
  // Resets current request. Only one request may be handled at time.
  private func resetRequest(result: AnyObject = NSNull(), errorMessage: String? = nil) {
    self.callJsCallback(result, errorMessage: errorMessage)
    
    self.request = nil
    self.completion = nil
    self.jsCallback = nil
  }
  
  // Wrapper around JavaScript callback.
  private func callJsCallback(result: AnyObject = NSNull(), errorMessage: String? = nil) {
    let error = errorMessage != nil ? ["message": errorMessage] as! AnyObject : NSNull()
    self.jsCallback?.callWithArguments([result, error])
  }
}

extension PurchasesAPI: SKProductsRequestDelegate {
  // Called when the Apple App Store responds to the product request.
  func productsRequest(request: SKProductsRequest, didReceiveResponse response: SKProductsResponse) {
    let products = response.products
    let invalidProductIds = response.invalidProductIdentifiers
    
    if (invalidProductIds.count > 0) {
      print("Purchase error: invalid product identifiers \(invalidProductIds)")
    }
    
    self.completion?(products, nil)
  }
  
  // Called if the request failed to execute.
  func request(request: SKRequest, didFailWithError error: NSError) {
    self.completion?(nil, error)
  }
  
  // Called when the request has completed.
  func requestDidFinish(request: SKRequest) {
  }
}

extension PurchasesAPI: SKPaymentTransactionObserver {
  // Tells an observer that one or more transactions have been updated.
  func paymentQueue(queue: SKPaymentQueue, updatedTransactions transactions: [SKPaymentTransaction]) {
    for transaction in transactions {
      switch transaction.transactionState {
      case .Purchasing:
        break;
      case .Purchased:
        self.completeTransaction(transaction)
      case .Failed:
        self.failTransaction(transaction)
      case .Restored:
        self.restoreTransaction(transaction)
      case .Deferred:
        break;
      }
    }
  }
  
  private func completeTransaction(transaction: SKPaymentTransaction) {
    SKPaymentQueue.defaultQueue().finishTransaction(transaction)
    
    let productId = transaction.payment.productIdentifier
    self.onProductPurchaseSuccess(productId)
  }
  
  private func failTransaction(transaction: SKPaymentTransaction) {
    SKPaymentQueue.defaultQueue().finishTransaction(transaction)
    
    if transaction.error!.code != SKErrorCode.PaymentCancelled.rawValue {
      let errorMessage = "Purchase error: (transaction \(transaction.transactionIdentifier)) \(transaction.error!.description)"
      print(errorMessage)
      self.onProductPurchaseFailure(errorMessage)
    }
  }
  
  private func restoreTransaction(transaction: SKPaymentTransaction) {
    SKPaymentQueue.defaultQueue().finishTransaction(transaction)
    
    guard let original = transaction.originalTransaction else {
      let errorMessage = "Purchase error: unable to restore transaction \(transaction.transactionIdentifier)"
      print(errorMessage)
      self.onProductPurchaseFailure(errorMessage)
      return
    }
    
    let productId = original.payment.productIdentifier
    self.onProductPurchaseSuccess(productId)
  }
}