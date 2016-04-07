# NOTE: Use http://www.getcreditcardnumbers.com/ to generate fake credit cards.

billingFormSchema = new SimpleSchema(
  plan:
    label: 'Subscription plan'
    type: String
    allowedValues: ['basic', 'pro']
  email:
    label: 'E-mail address'
    type: String
    regEx: SimpleSchema.RegEx.Email
  number:
    label: 'Credit card number'
    type: String
    custom: PaymentsHelpers.CreditCardValidation
    autoform:
      type: 'payments/creditCard'
  expiry:
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

startSubmitting = () ->
  Session.set('billing.submit', true)
  return

endSubmitting = () ->
  Session.set('billing.submit', false)
  return

showErrorAlert = (message) ->
  Session.set('billing.status', 'error')
  Session.set('billing.message', message)
  return

showSuccessAlert = () ->
  Session.set('billing.status', 'success')
  Session.set('billing.message', 'The payment was successful! Thanks for subscription!')
  return

hideAlert = () ->
  Session.set('billing.status', null)
  Session.set('billing.message', null)
  return

Meteor.startup(() ->
  key = Meteor.settings.public.stripePublishableKey
  Stripe.setPublishableKey(key)
)

Template.billingForm.helpers(
  billingFormSchema: () -> billingFormSchema
  isSubmitting: () -> !!Session.get('billing.submit')
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
        startSubmitting()
        hideAlert()
        return
      onSubmit: ({plan, email, number, expiry, cvc}) ->
        done = this.done
        [exp_month, exp_year] = expiry.split('/')

        Stripe.card.createToken({number, cvc, exp_month, exp_year}, (_, {id, error}) ->
          if error?
            done(error)
          else
            Meteor.call('subscribeStripePlan', {plan, email, token: id}, (error) ->
              done(error)
            )
        )

        return false
      onSuccess: (formType) ->
        showSuccessAlert()
        return
      onError: (formType, {message}) ->
        showErrorAlert(message)
        return
      endSubmit: () ->
        endSubmitting()
        return
  )
)

Template.billingForm.events(
  'click .plan-options>.btn': ({target}) ->
    value = $('input:radio', target).val()
    $('input:hidden').val(value)
)
