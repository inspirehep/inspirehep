class ResponseInterceptor {
  constructor(page) {
    this.page = page;
    this.responses = [];
    this.registerResponseListener();
  }

  registerResponseListener() {
    this.page.on('response', response => {
      this.responses.push(response);
    });
  }

  getFirstResponseByUrl(url) {
    return this.responses.filter(response => response.url() === url)[0];
  }

  getResponsesWhere(filterFunction) {
    return this.responses.filter(filterFunction);
  }
}

module.exports = {
  ResponseInterceptor,
};
