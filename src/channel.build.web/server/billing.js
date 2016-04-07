const key = Meteor.settings.stripeSecretKey,
      Stripe = StripeAPI(key);

Match.Email = Match.Where((value) => {
  check(value, String);
  return SimpleSchema.RegEx.Email.test(value);
});

Meteor.methods({
  subscribeStripePlan({plan, email, token}) {
    check(plan, Match.OneOf('basic', 'pro'));
    check(email, Match.Email);
    check(token, String);

    let createCustomer = Meteor.wrapAsync((done) => {
      Stripe.customers.create({plan, email, source: token}, (error, customer) => {
        if (error) {
          done(new Meteor.Error(error.type, error.message, error.detail));
        } else {
          console.log('+++++++ STRIPE CUSTOMER +++++++', customer);
          done();
        }
      });
    });

    createCustomer();
  },
});

Router.route('/stripe/webhook', { where: 'server' })
  .post(function () {
    console.log('+++++++ STRIPE WEBHOOK +++++++', this.params);
    this.response.end();
  });
