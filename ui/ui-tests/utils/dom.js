function getMetaDescription(page) {
  return page.$eval('head > meta[name="description"]', element => element.content);
}

module.exports = {
  getMetaDescription,
}