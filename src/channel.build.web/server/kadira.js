try {
  Kadira.connect(
    Meteor.settings.private.kadiraAppId,
    Meteor.settings.private.kadiraAppSecret
  );
} catch (error) {
  console.log(`An error occured while trying to use Kadira credentials. ` +
              `Please fill the correct values for Kadira credentials in Meteor settings file. ` +
              `${error.message}`);
}
