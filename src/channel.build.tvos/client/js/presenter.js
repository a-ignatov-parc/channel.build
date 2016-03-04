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
          onrender = target.getAttribute('onrender'),
          data = target.getAttribute('data'),
          dataMethod = target.getAttribute('data-method'),
          dataArgs = target.getAttribute('data-args'),
          presentMethod = target.getAttribute('present-method'),
          dataPromise = data ? this.dataController.getData(data) :
                               dataMethod ? this.dataController.getDataFromMethod(dataMethod, dataArgs) :
                                            Promise.resolve({}),
          onRenderHandlers = (onrender ? onrender.split(';') : [])
                             .concat(template ? ['setSelectEventHandler'] : [])
                             .map((handler) => this[handler] ? this[handler].bind(this) : null)
                             .filter((handler) => handler !== null);

    console.log(`Selecting ${target} with template="${template}", data="${data}",
                 data-method="${dataMethod}, data-args="${dataArgs}", present-method="${presentMethod}"...`);

    if (this[presentMethod]) {
      const present = this[presentMethod].bind(this);
      console.log(`Requesting data for ${target}...`);
      dataPromise.then((data) => {
        console.log(`Received data for ${target}: ${data}`);
        // Store target to access it in present methods.
        data.target = target;

        // If template name is present then load it and call present method.
        // Otherwise simply run present method. Also call onrender handlers.
        if (template) {
          this.resourceLoader.getTvml(template, data).then((doc) => {
            onRenderHandlers.forEach((handler) => handler({doc, data}));
            present({doc, data});
          });
        } else {
          onRenderHandlers.forEach((handler) => handler({data}));
          present({data});
        }
      });
    }
  }

  onVideoSearch({keyboard, partial, doc, data}) {
    const query = keyboard.text,
          resultsContainer = doc.getElementById('search-results'),
          results = this.dataController.fuzzySearchVideos(query, data),
          resultDocPromises = results.map((video) => this.resourceLoader.getTvml(partial, video));

    Promise.all(resultDocPromises).then((resultDocs) => {
      const resultNodes = resultDocs.map((rdoc) => rdoc.documentElement);

      // Clear all the previous results.
      while (resultsContainer.lastChild) {
        resultsContainer.removeChild(resultsContainer.lastChild);
      }

      // Fill the new results.
      resultNodes.forEach((rnode) => {
        doc.adoptNode(rnode);
        resultsContainer.appendChild(rnode);
      });
    });
  }

  presentDoc({doc, data}) {
    navigationDocument.pushDocument(doc);
  }

  /**
   * Presents template as a modal dialog.
   * @param  {string}  name Name of TVML file with the template.
   * @param  {object}  data Data for the template.
   * @return {promise}      Promise with empty result.
   */
  presentModal({doc, data}) {
    navigationDocument.presentModal(doc);
  }

  presentMenuBarItem({doc, data}) {
    const menuItem = data.target,
          feature = menuItem.parentNode.getFeature('MenuBarDocument');

    if (feature && !feature.getDocument(menuItem)) {
      feature.setDocument(doc, menuItem);
    }
  }

  presentVideo({data}) {
    let player = new Player(),
        video = new MediaItem('video', data.url);

    video.title = data.title;
    video.description = data.description;

    player.playlist = new Playlist();
    player.playlist.push(video);

    player.play();
  }

  setSelectEventHandler({doc}) {
    doc.addEventListener('select', this.onSelect);
  }

  setVideoSearchEventHandler({doc, data}) {
    const searchField = doc.getElementsByTagName('searchField').item(0),
          partial = searchField.getAttribute('result-partial');
    let keyboard = searchField.getFeature('Keyboard');
    keyboard.onTextChange = this.onVideoSearch.bind(this, {keyboard, partial, doc, data});
  }
}

module.exports = Presenter;
