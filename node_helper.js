const NodeHelper = require("node_helper");
const Parser = require("rss-parser");

module.exports = NodeHelper.create({
  start: function() {
    console.log("Starting node_helper for module [" + this.name + "]");
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === "START_FETCHING_FACTS") {
      this.fetchFact(payload);
    }
  },

  fetchFact: function(config) {
    const self = this;
    const parser = new Parser();

    parser.parseURL(config.rssFeedUrl)
      .then(function(feed) {
        const fact = self.extractFactFromRSS(feed);
        self.sendSocketNotification("FACT_FETCHED", fact);
        self.scheduleNextFetch(config.updateInterval);
      })
      .catch(function(error) {
        console.error("Failed to fetch historical fact: " + error);
        self.scheduleNextFetch(config.updateInterval);
      });
  },

  extractFactFromRSS: function(feed) {
    const today = new Date();
    const date = `${today.getMonth() + 1}/${today.getDate()}`;

    for (const item of feed.items) {
      const pubDate = new Date(item.pubDate);
      const itemDate = `${pubDate.getMonth() + 1}/${pubDate.getDate()}`;

      if (itemDate === date) {
        return item.title;
      }
    }

    return "No historical fact found for today.";
  },

  scheduleNextFetch: function(updateInterval) {
    const self = this;
    setTimeout(function() {
      self.fetchFact();
    }, updateInterval);
  },
});
