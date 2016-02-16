/**
 * Presenter for the application. Handles models data and presents it as a view.
 */

class Presenter {
  constructor(resourceLoader) {
    this.resourceLoader = resourceLoader;
  }

  /**
   * Presents template as a modal dialog.
   * @param  {string}  name Name of TVML file with the template.
   * @param  {object}  data Data for the template.
   * @return {promise}      Promise with empty result.
   */
  presentModal(name, data) {
    return this.resourceLoader.getTvml(name, data).then((doc) => {
      navigationDocument.presentModal(doc);
    });
  }
}

module.exports = Presenter;
