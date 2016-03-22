/**
 * A set of helper methods.
 */

const Utility = {
  /**
   * Checks whether a string is a valid URL.
   * NOTE: http://stackoverflow.com/a/14582229/1211780
   * @param  {string}  str String to check.
   * @return {Boolean}     True if the string is a valid URL, otherwise false.
   */
  isUrl(str) {
    var pattern = new RegExp('^(https?:\\/\\/)'+ // protocol (make it required)
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return pattern.test(str);
  }
};

module.exports = Utility;
