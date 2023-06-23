const NodeHelper = require("node_helper");
const axios = require("axios");
const cheerio = require("cheerio");

module.exports = NodeHelper.create({
  start: function() {
    console.log("Starting node_helper for module [" + this.name + "]");
  },

  // Handle socket notifications.
  socketNotificationReceived: function(notification) {
    if (notification === "START_FETCHING_FACTS") {
      this.fetchFact();
    }
  },

  // Fetch a historical fact from Britannica.
  fetchFact: function() {
    const self = this;
    const today = new Date();
    const date = `${today.getMonth() + 1}/${today.getDate()}`;

    axios
      .get(`https://www.britannica.com/on-this-day/${date}`)
      .then(function(response) {
        const fact = self.extractFactFromHTML(response.data);
        self.sendSocketNotification("FACT_FETCHED", fact);
        self.scheduleNextFetch();
      })
      .catch(function(error) {
        console.error("Failed to fetch historical fact: " + error);
        self.scheduleNextFetch();
      });
  },

  // Extract the fact from the Britannica HTML.
  extractFactFromHTML: function(html) {
    const $ = cheerio.load(html);
    const factElement = $(".fact-module-text");
    return factElement.text().trim();
  },

  // Schedule the next fetch after the specified interval.
  scheduleNextFetch: function() {
    const self = this;
    setTimeout(function() {
      self.fetchFact();
    }, this.config.updateInterval);
  },
});
