/**
 * Presenter for the application. Handles models data and presents it as a view.
 */

class Presenter {
  constructor(resourceLoader, dataController) {
    this.resourceLoader = resourceLoader;
    this.dataController = dataController;
    this.onSelect = this.onSelect.bind(this);
  }

  presentRoot(name) {
    return this.resourceLoader.getTvml(name).then((doc) => {
      doc.addEventListener('select', this.onSelect);
      navigationDocument.pushDocument(doc);
    });
  }

  onSelect(event) {
    const target = event.target,
          template = target.getAttribute('template'),
          data = target.getAttribute('data'),
          dataMethod = target.getAttribute('data-method'),
          dataArgs = target.getAttribute('data-args'),
          presentMethod = target.getAttribute('present-method'),
          dataPromise = data ? this.dataController.getData(data) :
                               dataMethod ? this.dataController.getDataFromMethod(dataMethod, dataArgs) :
                                            Promise.resolve({});

    console.log(`Selecting ${target} with template="${template}", data="${data}",
                 data-method="${dataMethod}, data-args="${dataArgs}", present-method="${presentMethod}"...`);

    if (this[presentMethod]) {
      console.log(`Requesting data for ${target}...`);
      dataPromise.then((data) => {
        console.log(`Received data for ${target}: ${data}`);
        // Store target to access it in present methods.
        data.target = target;
        this[presentMethod](template, data);
      });
    }
  }

  presentDoc(name, data) {
    return this.resourceLoader.getTvml(name, data).then((doc) => {
      doc.addEventListener('select', this.onSelect);
      navigationDocument.pushDocument(doc);
    });
  }

  /**
   * Presents template as a modal dialog.
   * @param  {string}  name Name of TVML file with the template.
   * @param  {object}  data Data for the template.
   * @return {promise}      Promise with empty result.
   */
  presentModal(name, data) {
    return this.resourceLoader.getTvml(name, data).then((doc) => {
      doc.addEventListener('select', this.onSelect);
      navigationDocument.presentModal(doc);
    });
  }

  presentMenuBarItem(name, data) {
    const menuItem = data.target,
          feature = menuItem.parentNode.getFeature('MenuBarDocument');

    return this.resourceLoader.getTvml(name, data).then((doc) => {
      if (feature && !feature.getDocument(menuItem)) {
        doc.addEventListener('select', this.onSelect);
        feature.setDocument(doc, menuItem);
      }
    });
  }

  presentVideo(name, data) {
    let player = new Player(),
        video = new MediaItem('video', data.url);

    video.title = data.title;
    video.description = data.description;

    player.playlist = new Playlist();
    player.playlist.push(video);

    player.play();
  }
}

module.exports = Presenter;
