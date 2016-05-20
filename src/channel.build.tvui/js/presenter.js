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

  /**
   * Presents the starting template of the app.
   * @param  {string} name Name of the root template.
   * @return {promise}     The result of promise contains loaded template document.
   */
  presentRoot(name) {
    return this.resourceLoader.getTvml(name).then(this.attachDefaultBehaviour);
  }

  /**
   * Attaches default event handlers to the document and presents it.
   * @param  {document} doc DOM document to attach default behavior to.
   */
  attachDefaultBehaviour(doc) {
    doc.addEventListener('select', this.onSelect);
    this.presentDoc({doc});
  }

  /**
   * Attaches default event handlers to the document and presents it as a modal dialog.
   * @param  {document} doc DOM document to attach default behavior to.
   */
  attachModalDefaultBehaviour(doc) {
    doc.addEventListener('select', this.onSelect);
    this.presentModal({doc});
  }

  /**
   * Main templating engine event handler.
   * Processes attributes of the element on select event:
   *
   * 'template'       - name of a template to render on select.
   * 'onrender'       - method name of Presenter class to run before rendering the template.
   * 'data'           - JSON string of data for the template.
   * 'data-method'    - same as 'data', but the data is fetched from DataController or ChannelApi method.
   * 'data-args'      - JSON string of object representing arguments for 'data-method' method.
   * 'present-method' - custom method of Presenter class to render the template.
   *
   * @param  {event} event Select event object.
   */
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

  /**
   * Event handler for video search input.
   * @param  {keyboard} keyboard TVJS Keyboard object received from getFeature('Keyboard') call.
   * @param  {string}   partial  Name of a template for search result.
   * @param  {document} doc      DOM document of page where search results should be shown. Search page.
   * @param  {object}   data     Data for DOM document with search results. Array of videos.
   */
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

  /**
   * Presents DOM document on the screen.
   * @param  {document} doc DOM document to present.
   */
  presentDoc({doc}) {
    navigationDocument.pushDocument(doc);
  }

  /**
   * Presents DOM document on the screen as a modal dialog.
   * @param  {document} doc DOM document to present.
   */
  presentModal({doc}) {
    navigationDocument.presentModal(doc);
  }

  /**
   * Dismisses currently active modal dialog.
   */
  dismissModal() {
    navigationDocument.dismissModal();
  }

  /**
   * Shows content of selected tab on the top of the main screen.
   * @param  {document} doc  DOM document of tab's content.
   * @param  {object}   data Data of tab's document template.
   */
  presentMenuBarItem({doc, data}) {
    const menuItem = data.target,
          feature = menuItem.parentNode.getFeature('MenuBarDocument');

    if (feature && !feature.getDocument(menuItem)) {
      feature.setDocument(doc, menuItem);
    }
  }

  /**
   * Shows either product page for a video with purchase button
   * if the video is paid and is not purchased by a user or plays the video.
   * @param  {object} data Data for video template.
   */
  presentVideo({data}) {
    if (data.isPurchasable) {
      this.presentPurchase({data});
    } else {
      this.presentPlay({data});
    }
  }

  /**
   * Playbacks a video.
   * @param  {object} data Properties of the video to play.
   */
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

  /**
   * Shows product page for a video with purchase button and description of a video.
   * @param  {object} data Properties of the video.
   */
  presentPurchase({data}) {
    const template = data.target.getAttribute('purchase-template');
    data.author = ChannelName; // Name of tvOS application.
    this.resourceLoader.getTvml(template, data).then(this.attachDefaultBehaviour);
  }

  /**
   * Event handler for play button of product page of a video. Plays the video.
   * @param  {object} data Properties of the video to play.
   */
  onPlaySelect({data}) {
    presentPlay({data});
  }

  /**
   * Event handler for buy button of product page of a video. Makes in-app purchase of the video.
   * @param  {object} data Properties of the video to buy.
   */
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

  /**
   * Shows modal dialog after in-app purchase has been processed successfully.
   * @param  {string} title Title of the dialog.
   * @param  {text}   text  Text of the dialog.
   * @param  {data}   data  Additional data for the alert template.
   */
  presentPurchaseSuccessAlert({title, text, data}) {
    const template = data.target.getAttribute('success-alert-template');
    data.title = title;
    data.text = text;
    this.resourceLoader.getTvml(template, data).then(this.attachModalDefaultBehaviour);
  }

  /**
   * Sets event handler for select action.
   * @param {[type]} options.doc [description]
   */
  setSelectEventHandler({doc}) {
    doc.addEventListener('select', this.onSelect);
  }

  /**
   * Sets event handler for search field to show search results on input.
   * @param {document} doc  DOM document with <searchField> element.
   * @param {object}   data Data to search.
   */
  setVideoSearchEventHandler({doc, data}) {
    const searchField = doc.getElementsByTagName('searchField').item(0),
          partial = searchField.getAttribute('result-partial');
    let keyboard = searchField.getFeature('Keyboard');
    keyboard.onTextChange = this.onVideoSearch.bind(this, {keyboard, partial, doc, data});
  }

  /**
   * Navigates back to the previous page of the navigation stack.
   */
  navigateBack() {
    navigationDocument.dismissModal();
    navigationDocument.popDocument();
  }
}

module.exports = Presenter;
