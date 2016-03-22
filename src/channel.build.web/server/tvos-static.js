var fs = Meteor.npmRequire('fs');

function serveTvosFile() {
  var tvosClientPath = process.env.TVOS_CLIENT_PATH,
      urlMatch = this.url.match(/\/(.+?)\/(.+)/),
      fileType = urlMatch[1],
      fileName = urlMatch[2],
      filePath = null,
      fileStatus = null,
      contentType = null;

  switch (fileType) {
  case 'tvml':
    filePath = `${tvosClientPath}/public/tvml/${fileName}`;
    contentType = 'application/xml';
    break;
  case 'tvjs':
    filePath = `${tvosClientPath}/dist/${fileName}`;
    contentType = 'application/javascript';
    break;
  }

  try {
    fileStatus = fs.statSync(filePath);
  } catch (error) {
    this.response.statusCode = 404;
    this.response.end();
  }

  this.response.writeHead(200, {
    'Content-Type': contentType,
    'Content-Disposition': 'attachment; filename=' + fileName,
    'Content-Length': fileStatus.size
  });

  fs.createReadStream(filePath).pipe(this.response);
}

Router.route('/tvml/:name', serveTvosFile, { where: 'server' });
Router.route('/tvjs/:name', serveTvosFile, { where: 'server' });
