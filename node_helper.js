const NodeHelper = require("node_helper");
const Parser = require("rss-parser");

module.exports = NodeHelper.create({
  start: function() {
    console.log("Starting node_helper for module [" + this.name + "]");
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === "START_FETCHING_FACTS") {
      this.fetchFacts(payload);
    }
  },

  fetchFacts: function(config) {
    const self = this;
    const parser = new Parser();

    parser.parseURL(config.rssFeedUrl)
      .then(function(feed) {
        const facts = self.extractFactsFromRSS(feed);
        self.sendSocketNotification("FACT_FETCHED", facts);
      })
      .catch(function(error) {
        console.error("Failed to fetch historical facts: " + error);
      });
  },

  extractFactsFromRSS: function(feed) {
    const facts = [];
    const today = new Date();
    const date = `${today.getMonth() + 1}/${today.getDate()}`;

    for (const item of feed.items) {
      const pubDate = new Date(item.pubDate);
      const itemDate = `${pubDate.getMonth() + 1}/${pubDate.getDate()}`;

      if (itemDate === date) {
        facts.push(item.title);
      }
    }

    return facts;
  },
});
