/**
 * Exposes API to load app's resources.
 */

import Mustache from 'mustache';
import Settings from './settings';

class ResourceLoader {
  constructor(networkController) {
    this.networkController = networkController;
    this.domParser = new DOMParser();
  }

  /**
   * Gets TVML template.
   * @param  {string} name Name of TVML file with the template.
   * @param  {object} data Data for the template.
   * @return {promise}     Promise with parsed template document.
   */
  getTvml(name, data = {}) {
    const path = `${Settings.tvmlPath}${name}`;
    return this.networkController.get(path)
      .then(tvml => {
        const rendered = Mustache.render(tvml, data);
        return this.domParser.parseFromString(rendered, 'application/xml');
      });
  }
}

module.exports = ResourceLoader;
