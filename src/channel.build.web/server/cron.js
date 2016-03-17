SyncedCron.config({
  utc: true
});

// NOTE: https://sheharyar.me/blog/regular-mongo-backups-using-cron/
SyncedCron.add({
  name: 'MongoDB backup',
  schedule: function (parser) {
    return parser.text('at 00:00');
  },
  job: function () {
    var mongodump = process.env.MONGODUMP_PATH,
        database = process.env.MONGO_DATABASE || 'meteor',
        appname = 'channel.build',
        mongoUrl = process.env.MONGO_URL,
        host = mongoUrl.match(/mongodb:\/\/(.*)\/meteor/)[1],
        timestamp = shell.exec('date +%F-%H%M').output.trim(),
        backupsPath = `${process.env.HOME}/backups/${appname}`,
        archivePath = `${backupsPath}/${appname}-${timestamp}.gzip`;

    shell.mkdir('-p', backupsPath);
    shell.exec(`${mongodump} --host ${host} --db ${database} --gzip --archive=${archivePath}`);
  }
});

SyncedCron.start();
