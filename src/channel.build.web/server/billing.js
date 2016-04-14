const key = Meteor.settings.private.stripeSecretKey,
      Stripe = StripeAPI(key);

Match.Plans = Match.OneOf(...Meteor.settings.public.plans.map((p) => p.name));

Match.Email = Match.Where((value) => {
  check(value, String);
  return SimpleSchema.RegEx.Email.test(value);
});

Meteor.methods({
  subscribeStripePlan({plan, email, token}) {
    check(plan, Match.Plans);
    check(email, Match.Email);
    check(token, String);

    let createCustomer = Meteor.wrapAsync((done) => {
      console.log(`User ${email} (${Meteor.userId()}) is ordering a ${plan} subscription with token ${token}...`);
      Stripe.customers.create({plan, email, source: token}, Meteor.bindEnvironment((error, customer) => {
        if (error) {
          console.log(`An error occured while ordering a subscription with token ${token}: ${error.message}`);
          done(new Meteor.Error(error.type, error.message, error.detail));
        } else {
          // Check whether it is an additional payment for subsequent month or new/renew subscription.
          let sub = Meteor.user().subscription,
              start = sub && sub.activeUntil ? moment(sub.activeUntil) : moment(),
              activeUntil = start.add(1, 'months').toDate();

          console.log(`A payment for subscription with token ${token} was successful! customerId: ${customer.id}, plan: ${plan}, activeUntil: ${activeUntil}`);

          Meteor.users.update({ _id: Meteor.userId() }, {
            $set: {
              subscription: {
                customerId: customer.id,
                plan, activeUntil,
              }
            }
          });
          done();
        }
      }));
    });

    createCustomer();
  },
});

Router.route('/stripe/webhook', { where: 'server' })
  .post(function () {
    console.log('+++++++ STRIPE WEBHOOK +++++++', this.params);
    this.response.end();
  });
