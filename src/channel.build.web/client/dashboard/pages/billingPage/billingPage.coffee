billingFormSchema = new SimpleSchema(
  email:
    label: 'Email address'
    type: String
    regEx: SimpleSchema.RegEx.Email
)

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
)

Template.billingForm.onCreated(() ->
  AutoForm.hooks(
    billingForm:
      onSubmit: (insertDoc, updateDoc, currentDoc) ->
        console.log(insertDoc, updateDoc, currentDoc)
        # if (customHandler(insertDoc)) {
        #   this.done();
        # } else {
        #   this.done(new Error("Submission failed"));
        # }
        # return false;
  )
)

Template.billingForm.onRendered(() ->
  $planOptions = $('.plan-options')
  $('.btn', $planOptions).click(() ->
    value = $('input:radio', this).val()
    $('input:hidden').val(value)
  )
)
