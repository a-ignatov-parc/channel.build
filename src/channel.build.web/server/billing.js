const Future = Meteor.npmRequire('fibers/future');

const key = Meteor.settings.private.stripeSecretKey,
      Stripe = StripeAPI(key);

Match.Plans = Match.OneOf(...Meteor.settings.public.plans.map((p) => p.name));

Match.Email = Match.Where((value) => {
  check(value, String);
  return SimpleSchema.RegEx.Email.test(value);
});

function verifyStripeEvent(eventId) {
  let verifyEvent = new Future();

  Stripe.events.retrieve(eventId, (error, event) => {
    if (error) {
      verifyEvent.throw(error);
    } else {
      verifyEvent.return(event);
    }
  });

  return verifyEvent.wait();
}

Meteor.methods({
  subscribeStripePlan({plan, email, token}) {
    check(plan, Match.Plans);
    check(email, Match.Email);
    check(token, String);

    let createCustomer = new Future();

    console.log(`User ${email} (${Meteor.userId()}) is ordering a ${plan} subscription with token ${token}...`);

    Stripe.customers.create({plan, email, source: token}, Meteor.bindEnvironment((error, customer) => {
      if (error) {
        console.log(`An error occured while ordering a subscription with token ${token}: ${error.message}`);
        createCustomer.throw(error);
      } else {
        // Check whether it is an additional payment for subsequent month or new/renew subscription.
        let sub = Meteor.user().subscription,
            start = sub && sub.activeUntil ? moment(sub.activeUntil) : moment(),
            activeUntil = start.add(1, 'months').toDate();

        Meteor.users.update({ _id: Meteor.userId() }, {
          $set: {
            subscription: {
              customerId: customer.id,
              plan, activeUntil,
            }
          }
        }, (error) => {
          if (error) {
            createCustomer.throw(error);
          } else {
            console.log(`A payment for subscription with token ${token} was successful! customerId: ${customer.id}, plan: ${plan}, activeUntil: ${activeUntil}`);
            createCustomer.return(customer);
          }
        });
      }
    }));

    try {
      return createCustomer.wait();
    } catch (error) {
      throw new Meteor.Error(error.type || 'InternalError', error.message, error.detail);
    }
  },
});

Router.route('/stripe/webhook', { where: 'server' })
  .post(function () {
    let self = this,
        eventId = self.request.body ? self.request.body.id : null;

    if (eventId) {
      console.log(`Received Stripe event with ID ${eventId}. Verifying...`);
      try {
        let event = verifyStripeEvent(eventId);
        console.log(`Stripe event with ID ${event.id} of type ${event.type} is verified.`);
        switch (event.type) {
          case 'customer.subscription.created':
          case 'customer.subscription.updated':
            console.log(`Stripe event with ID ${event.id} data:`, event.data);
            self.response.writeHead(200);
            break;
        }
      } catch (error) {
        console.log(`An error occured while processing Stripe event with ID ${eventId}:`, error.message);
        self.response.writeHead(500);
      }
    }

    self.response.end();
  });
