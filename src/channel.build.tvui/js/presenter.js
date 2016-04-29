/**
 * Presenter for the application. Handles models data and presents it as a view.
 */

import Utility from './utility';

class Presenter {
  constructor(resourceLoader, dataController) {
    this.resourceLoader = resourceLoader;
    this.dataController = dataController;
    this.onSelect = this.onSelect.bind(this);
    this.onVideoSearch = this.onVideoSearch.bind(this);
    this.attachDefaultBehaviour = this.attachDefaultBehaviour.bind(this);
    this.attachModalDefaultBehaviour = this.attachModalDefaultBehaviour.bind(this);
  }

  presentRoot(name) {
    return this.resourceLoader.getTvml(name).then(this.attachDefaultBehaviour);
  }

  attachDefaultBehaviour(doc) {
    doc.addEventListener('select', this.onSelect);
    this.presentDoc({doc});
  }

  attachModalDefaultBehaviour(doc) {
    doc.addEventListener('select', this.onSelect);
    this.presentModal({doc});
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

    console.log(`Selecting ${target.tagName} with template="${template}", data=${data}",
                 data-method="${dataMethod}", data-args="${dataArgs}", present-method="${presentMethod}"...`);

    if (this[presentMethod]) {
      const present = this[presentMethod].bind(this);
      console.log(`Requesting data for ${target.tagName}...`);
      dataPromise.then((data) => {
        console.log(`Received data for ${target.tagName}:`, data);
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

  presentDoc({doc}) {
    navigationDocument.pushDocument(doc);
  }

  presentModal({doc}) {
    navigationDocument.presentModal(doc);
  }

  dismissModal() {
    navigationDocument.dismissModal();
  }

  presentMenuBarItem({doc, data}) {
    const menuItem = data.target,
          feature = menuItem.parentNode.getFeature('MenuBarDocument');

    if (feature && !feature.getDocument(menuItem)) {
      feature.setDocument(doc, menuItem);
    }
  }

  presentVideo({data}) {
    if (data.isPurchasable) {
      this.presentPurchase({data});
    } else {
      this.presentPlay({data});
    }
  }

  presentPlay({data}) {
    let player = new Player(),
        video = new MediaItem('video', data.video);

    video.title = data.title;
    video.description = data.description;

    player.playlist = new Playlist();
    player.playlist.push(video);

    player.play();

    // Register video playback for analytics.
    this.dataController.channelApi.postAnalytics({
      operation: 'play',
      target: data._id
    });
  }

  presentPurchase({data}) {
    const template = data.target.getAttribute('purchase-template');
    data.author = ChannelName; // Name of tvOS application.
    this.resourceLoader.getTvml(template, data).then(this.attachDefaultBehaviour);
  }

  onPlaySelect({data}) {
    presentPlay({data});
  }

  onBuySelect({data}) {
    Purchases.purchaseProduct(data.productId, (productId, error) => {
      if (error) {
        console.log(`An error occured while purchasing a product: ${error.message}`);
      } else {
        console.log(`A product with ID ${productId} was successfully purchased!`);
        Utility.asap(() => this.presentPurchaseSuccessAlert({
          title: 'Thank you',
          text: 'Your purchase was successfull.\nClick OK to play the video.',
          data
        }));
      }
    });
  }

  presentPurchaseSuccessAlert({title, text, data}) {
    const template = data.target.getAttribute('success-alert-template');
    data.title = title;
    data.text = text;
    this.resourceLoader.getTvml(template, data).then(this.attachModalDefaultBehaviour);
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

  navigateBack() {
    navigationDocument.dismissModal();
    navigationDocument.popDocument();
  }
}

module.exports = Presenter;
