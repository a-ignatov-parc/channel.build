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

@objc protocol PurchasesAPIExport: JSExport {
  static func instance() -> PurchasesAPIExport
  func purchaseProduct(productId: String, callback: JSValue?)
  func isProductPurchased(productId: String) -> Bool
}

@objc class PurchasesAPI: NSObject, PurchasesAPIExport {
  var request: SKProductsRequest?
  var completion: (([SKProduct]?, NSError?) -> Void)?
  
  // function (response, error) { ... }
  var jsCallback: JSValue?
  
  static func instance() -> PurchasesAPIExport {
    return PurchasesAPI()
  }
  
  override init() {
    super.init()
    SKPaymentQueue.defaultQueue().addTransactionObserver(self)
  }
  
  func purchaseProduct(productId: String, callback: JSValue?) {
    print("Purchasing product with ID \(productId)...")
    
    self.getProducts([productId], completion: { products, error in
      guard let product = products?.first else {
        print("Purchase error: \(error)")
        return
      }
      
      self.queuePayment(product)
    }, jsCallback: callback)
  }
  
  func isProductPurchased(productId: String) -> Bool {
    return NSUserDefaults.standardUserDefaults().boolForKey(productId)
  }
  
  private func getProducts(productIds: [String], completion: ([SKProduct]?, NSError?) -> Void, jsCallback: JSValue?) {
    guard self.request == nil else { return }
    
    print("Getting products information with IDs \(productIds)...")
    
    self.completion = completion
    self.jsCallback = jsCallback
    self.request = SKProductsRequest(productIdentifiers: Set(productIds))
    self.request?.delegate = self
    self.request?.start()
  }
  
  private func queuePayment(product: SKProduct) {
    print("Queueing a payment transaction for product \(product)...")
    
    let payment = SKPayment(product: product)
    SKPaymentQueue.defaultQueue().addPayment(payment)
  }
  
  // TODO: The alert message is empty...
  //       JS callback doesn't work...
  private func onProductPurchaseSuccess(productId: String) {
    print("Purchase of product with ID \(productId) was successful!")
    
    NSUserDefaults.standardUserDefaults().setBool(true, forKey: productId)
    NSNotificationCenter.defaultCenter().postNotificationName("Thanks for purchasing!", object: nil)
    self.jsCallback?.callWithArguments([productId, NSNull()])
    self.resetRequest()
  }
  
  private func onProductPurchaseFailure(error: String) {
    print("Purchase failed!")
    
    self.jsCallback?.callWithArguments([NSNull(), error])
    self.resetRequest()
  }
  
  private func resetRequest() {
    self.request = nil
    self.completion = nil
    self.jsCallback = nil
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
    self.jsCallback?.callWithArguments([NSNull(), error.description])
    self.resetRequest()
  }
  
  // Called when the request has completed.
  func requestDidFinish(request: SKRequest) {
    self.resetRequest()
  }
}

extension PurchasesAPI: SKPaymentTransactionObserver {
  // Tells an observer that one or more transactions have been updated.
  func paymentQueue(queue: SKPaymentQueue, updatedTransactions transactions: [SKPaymentTransaction]) {
    for transaction in transactions {
      switch transaction.transactionState {
      case .Purchased:
        self.completeTransaction(transaction)
      case .Failed:
        self.failTransaction(transaction)
      case .Restored:
        self.restoreTransaction(transaction)
      default:
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
      let error = "Purchase error: (transaction \(transaction.transactionIdentifier)) \(transaction.error!.description)"
      print(error)
      self.onProductPurchaseFailure(error)
    }
  }
  
  private func restoreTransaction(transaction: SKPaymentTransaction) {
    SKPaymentQueue.defaultQueue().finishTransaction(transaction)
    
    guard let original = transaction.originalTransaction else {
      let error = "Purchase error: unable to restore transaction \(transaction.transactionIdentifier)"
      print(error)
      self.onProductPurchaseFailure(error)
      return
    }
    
    let productId = original.payment.productIdentifier
    self.onProductPurchaseSuccess(productId)
  }
}