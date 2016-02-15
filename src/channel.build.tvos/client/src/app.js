require("babel-polyfill");

App.onLaunch = (options) => {
  var alert = createAlert("Hello World!", "It definitely works now on port 1337...");
  navigationDocument.presentModal(alert);
};

var createAlert = (title, description) => {
  var alertString = `<?xml version="1.0" encoding="UTF-8" ?>
    <document>
      <alertTemplate>
        <title>${title}</title>
        <description>${description}</description>
        <button>
          <text>OK</text>
        </button>
      </alertTemplate>
    </document>`;

  var parser = new DOMParser();
  var alertDoc = parser.parseFromString(alertString, "application/xml");

  return alertDoc;
};
