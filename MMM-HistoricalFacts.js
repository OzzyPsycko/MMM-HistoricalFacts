Module.register("MMM-HistoricalFacts", {
  // Module configuration options
  defaults: {
    updateInterval: 2 * 60 * 1000, // 2 minutes
    rssFeedUrl: "http://feeds.feedburner.com/historyorb/todayinhistory",
  },

  // Define start sequence.
  start: function() {
    Log.info("Starting module: " + this.name);
    this.sendSocketNotification("START_FETCHING_FACTS", this.config);
  },

  // Override the dom generator.
  getDom: function() {
    var wrapper = document.createElement("div");
    wrapper.className = "small";
    wrapper.innerHTML = this.fact || this.translate("LOADING");
    return wrapper;
  },

  // Handle incoming socket notifications.
  socketNotificationReceived: function(notification, payload) {
    if (notification === "FACT_FETCHED") {
      this.fact = payload;
      this.updateDom();
    }
  },
});
