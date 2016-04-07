# NOTE: Use http://www.getcreditcardnumbers.com/ to generate fake credit cards.

billingFormSchema = new SimpleSchema(
  email:
    label: 'Email address'
    type: String
    regEx: SimpleSchema.RegEx.Email
  number:
    label: 'Credit card number'
    type: String
    custom: PaymentsHelpers.CreditCardValidation
    autoform:
      type: 'payments/creditCard'
  expire:
    label: 'Expiration date'
    type: String
    custom: PaymentsHelpers.CCExpiryValidation
    autoform:
      type: 'payments/creditCardExpiry'
  cvc:
    label: 'CVC code'
    type: String
    custom: PaymentsHelpers.CVCValidation
    autoform:
      type: 'payments/creditCardCVC'
)

showErrorAlert = (message) ->
  Session.set('billing.status', 'error')
  Session.set('billing.message', message)

showSuccessAlert = () ->
  Session.set('billing.status', 'success')
  Session.set('billing.message', 'Success!')

hideAlert = () ->
  Session.set('billing.status', null)
  Session.set('billing.message', null)

Meteor.startup(() ->
  key = Meteor.settings.public.stripePublishableKey
  Stripe.setPublishableKey(key)
  StripeCheckout.configure(
    key: key
    token: (token) ->
      console.log('token', token)
  )
)

Template.billingForm.helpers(
  billingFormSchema: () -> billingFormSchema
  alertMessage: () -> Session.get('billing.message')
  alertClass: () -> switch Session.get('billing.message') && Session.get('billing.status')
                    when 'error' then 'alert-danger'
                    when 'success' then 'alert-success'
                    else 'hidden'
)

Template.billingForm.onRendered(() ->
  template = Template.instance()
  AutoForm.hooks(
    billingForm:
      beginSubmit: () ->
        hideAlert()
      onSubmit: (params) ->
        console.log(params)
        this.done()
        this.event.preventDefault()
      onSuccess: (formType, result) ->
        showSuccessAlert()
      onError: (formType, error) ->
        showErrorAlert(error.message)
  )
)

Template.billingForm.events(
  'click .plan-options>.btn': (e) ->
    value = $('input:radio', e.target).val()
    $('input:hidden').val(value)
)
