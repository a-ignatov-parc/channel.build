const Future = Meteor.npmRequire('fibers/future');

const key = Meteor.settings.private.stripeSecretKey,
      Stripe = StripeAPI(key);

Match.Plans = Match.OneOf(...Meteor.settings.public.plans.map((p) => p.name));

Match.Email = Match.Where((value) => {
  check(value, String);
  return SimpleSchema.RegEx.Email.test(value);
});

function createStripeCustomer({email, token}) {
  let createCustomer = new Future();

  Stripe.customers.create({email, source: token}, (error, customer) => {
    if (error) {
      console.log(`An error occured while creating a Stripe customer with email ${email} and token ${token}: ${error.message}`);
      createCustomer.throw(error);
    } else {
      createCustomer.return(customer);
    }
  });

  return createCustomer.wait();
}

function createStripeSubscription({customerId, plan}) {
  let createSubscription = new Future();

  Stripe.customers.createSubscription(customerId, {plan}, (error, subscription) => {
    if (error) {
      console.log(`An error occured while creating a Stripe subscription for customer ${customerId} and plan ${plan}: ${error.message}`);
      createSubscription.throw(error);
    } else {
      createSubscription.return(subscription);
    }
  });

  return createSubscription.wait();
}

function cancelStripeSubscription({customerId, subscriptionId}) {
  let cancelSubscription = new Future();

  Stripe.customers.cancelSubscription(customerId, subscriptionId, (error, subscription) => {
    if (error) {
      console.log(`An error occured while canceling a Stripe subscription ${subscriptionId} for customer ${customerId}: ${error.message}`);
      cancelSubscription.throw(error);
    } else {
      cancelSubscription.return(subscription);
    }
  });

  return cancelSubscription.wait();
}

function updateUserSubscription({userId, subscription}) {
  let updateUser = new Future();

  let activeUntilTime = subscription.status === 'canceled' ? subscription.canceled_at :
                                                             subscription.current_period_end;

  Meteor.users.update(userId ? { _id: userId } : { customerId: subscription.customer }, {
    $set: {
      customerId: subscription.customer,
      subscription: {
        id: subscription.id,
        plan: subscription.plan.id,
        status: subscription.status,
        activeUntil: moment(activeUntilTime * 1000).toDate(),
      }
    }
  }, (error, response) => {
    if (error) {
      console.log(`An error occured while updating user's subscription for customer ${customerId}: ${error.message}`);
      updateUser.throw(error);
    } else {
      updateUser.return(response);
    }
  });

  return updateUser.wait();
}

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

    let user = Meteor.user(),
        userId = Meteor.userId();

    console.log(`User ${email} (${userId}) is ordering a ${plan} subscription with token ${token}...`);

    try {
      let customerId = user.customerId,
          status = user.subscription && user.subscription.status,
          activeUntil = user.subscription && user.subscription.activeUntil,
          isActive = (status === 'active' || status === 'trialing') && moment() < moment(activeUntil || null);

      // If Stripe customer doesn't exist, create the new customer.
      if (!customerId) {
        console.log(`User ${email} (${userId}) has no associated Stripe customer. Creating it...`);
        let customer = createStripeCustomer({email, token});
        customerId = customer.id;
      }

      // If subscription is active already ignore the new subscription.
      // TODO: Implement update of subscription (changing plan).
      if (!isActive) {
        console.log(`User ${email} (${userId}) has no active Stripe subscription. Creating it...`);
        let subscription = createStripeSubscription({customerId, plan});
        updateUserSubscription({userId, subscription});
        console.log(`User ${email} (${userId}) has been successfully subscribed for ${plan} plan!`);
      } else {
        console.log(`User ${email} (${userId}) has active Stripe subscription. Skipping...`);
      }
    } catch (error) {
      throw new Meteor.Error(error.type || 'InternalError', error.message, error.detail);
    }
  },
  cancelStripePlan() {
    let user = Meteor.user(),
        userId = Meteor.userId(),
        customerId = user.customerId,
        subscriptionId = user.subscription && user.subscription.id;

    console.log(`User ${userId} is canceling her subscription...`);

    if (customerId && subscriptionId) {
      try {
        let subscription = cancelStripeSubscription({customerId, subscriptionId});
        updateUserSubscription({subscription});
      } catch (error) {
        throw new Meteor.Error(error.type || 'InternalError', error.message, error.detail);
      }
    } else {
      console.log(`User ${userId} has no subscription. Skipping...`);
    }
  },
});

Router.route('/webhooks/stripe', { where: 'server' })
  .post(function () {
    let self = this,
        event = self.request.body;

    if (event && event.id && event.type) {
      try {
        console.log(`Stripe event with ID ${event.id} of type ${event.type} has been received.`);
        switch (event.type) {
          case 'customer.subscription.created':
          case 'customer.subscription.updated':
          case 'customer.subscription.deleted':
            console.log(`Verifying and processing Stripe event with ID ${event.id} of type ${event.type}...`);
            event = verifyStripeEvent(event.id);
            let subscription = event.data.object;
            updateUserSubscription({subscription});
            console.log(`The subscription for customer ${subscription.customer} was successfully updated!`);
            self.response.writeHead(200);
            break;
        }
      } catch (error) {
        console.log(`An error occured while processing Stripe event with ID ${event.id}:`, error.message, error.stack);
        self.response.writeHead(500);
      }
    }

    self.response.end();
  });
