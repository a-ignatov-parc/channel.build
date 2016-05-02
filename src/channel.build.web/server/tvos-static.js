var fs = Meteor.npmRequire('fs');

function redirectToDefault() {
  this.response.writeHead(302, {
    'Location': `/tvos/v1${this.url}`
  });

  this.response.end();
}

function serveTvosFile() {
  var tvosClientPath = `${process.env.TVOS_CLIENT_PATH}/${this.params.version}`,
      fileType = this.params.type,
      fileName = this.params.name,
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
  default:
    console.log(`Error getting Apple TV client file: type ${fileType} is not supported!`);
    this.response.statusCode = 404;
    this.response.end();
    return;
  }

  try {
    fileStatus = fs.statSync(filePath);
  } catch (error) {
    console.log(`Error getting Apple TV client file: ${error}`);
    this.response.statusCode = 404;
    this.response.end();
    return;
  }

  this.response.writeHead(200, {
    'Content-Type': contentType,
    'Content-Disposition': 'attachment; filename=' + fileName,
    'Content-Length': fileStatus.size
  });

  fs.createReadStream(filePath).pipe(this.response);
}

Router.route('/tvml/:name', redirectToDefault, { where: 'server' });
Router.route('/tvjs/:name', redirectToDefault, { where: 'server' });
Router.route('/tvos/:version/:type/:name', serveTvosFile, { where: 'server' });
