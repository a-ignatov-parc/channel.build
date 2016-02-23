/**
 * Exposes API for AJAX requests.
 */

import Utility from './utility';

class NetworkController {
  constructor(hostUrl) {
    this.hostUrl = hostUrl;
  }

  /**
   * Converts path to URL.
   * @param  {string} path Path of URL.
   * @return {string}      Corresponding URL.
   */
  pathToUrl(path) {
    return `${this.hostUrl}${path}`;
  }

  /**
   * Main method to make AJAX request.
   * @param  {string}  method The HTTP method to use, such as "GET", "POST", "PUT", "DELETE", etc.
   * @param  {string}  url    URL or path of URL to send the request to.
   * @param  {object}  data   Data for the request.
   * @return {promise}        The result of promise contains response or an error.
   */
  ajax(method, url, data) {
    url = Utility.isUrl(url) ? url : this.pathToUrl(url);
    console.log(`Sending ${method} ${url} request with data: ${data}...`);

    return new Promise((resolve, reject) => {
      let req = new XMLHttpRequest();
      req.open(method, url);

      req.onload = () => {
        console.log(`Response for ${method} ${url} with status ${req.status} (${req.statusText}): ${req.response}`);
        if (req.status === 200) {
          resolve(req.response);
        } else {
          reject(Error(req.statusText));
        }
      };

      req.onerror = () => {
        reject(Error(req.statusText));
      };

      req.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
      req.send(data);
    });
  }

  /**
   * Makes GET AJAX request.
   * @param  {string}  url URL or path of URL to send the request to.
   * @return {promise}     The result of promise contains response or an error.
   */
  get(path) {
    return this.ajax('GET', path, null);
  }

  /**
   * Makes POST AJAX request.
   * @param  {string}  url  URL or path of URL to send the request to.
   * @param  {string}  data Data for the request.
   * @return {promise}      The result of promise contains response or an error.
   */
  post(path, data) {
    return this.ajax('POST', path, json);
  }

  /**
   * Makes GET AJAX request and parses response as JSON.
   * @param  {string}  url URL or path of URL to send the request to.
   * @return {promise}     The result of promise contains response as JSON or an error.
   */
  getJson(path) {
    return this.get(path).then(JSON.parse);
  }

  /**
   * Makes POST AJAX request, serializes data as JSON, parses response as JSON.
   * @param  {string}  url  URL or path of URL to send the request to.
   * @param  {object}  data Data for the request.
   * @return {promise}      The result of promise contains response as JSON or an error.
   */
  postJson(path, data) {
    const json = JSON.stringify(data);
    return this.post(path, json).then(JSON.parse);
  }
}

module.exports = NetworkController;
