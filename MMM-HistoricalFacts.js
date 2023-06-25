/* Magic Mirror
    * Module: MMM-HistoricalFacts
    *
    * By OzzyPsycko
    * 
    */
   
Module.register("MMM-HistoricalFacts", {
       
        requiresVersion: "2.1.0",
       
       // Module config defaults.
       defaults: {
           updateInterval: 60*1000, // every 10 minutes
           animationSpeed: 10,
           initialLoadDelay: 4950, // 0 seconds delay
           retryDelay: 1500,
           maxWidth: "400px",
           fadeSpeed: 11,
           rotateInterval: 20 * 1000,
           maxLength: null
       },
       
       // Define required scripts.
       getScripts: function() {
           return ["moment.js"];
       },
       
       getStyles: function() {
           return ["MMM-HistoricalFacts.css"];
       },

       // Define start sequence.
       start: function() {
           Log.info("Starting module: " + this.name);
           
           requiresVersion: "2.1.0",
           
           // Set locale.
           this.locale = window.navigator.userLanguage || window.navigator.language;
           this.url = "http://feeds.feedburner.com/historyorb/todayinhistory";
           this.HistoricalFacts = {};
           this.today = "";
           this.activeItem = 0;
           this.rotateInterval = null;
           this.scheduleUpdate();
       },
       
       processHistoricalFacts: function(data) {
         this.today = data.Today;
         this.HistoricalFacts = data;
         this.loaded = true;
     },
     
      scheduleCarousel: function() {
       		console.log("Scheduling HistoricalFacts items");
	   		this.rotateInterval = setInterval(() => {
				this.activeItem++;
				this.updateDom(this.config.animationSpeed);
			}, this.config.rotateInterval);
	   },
     
     scheduleUpdate: function() {
         setInterval(() => {
             this.getHistoricalFacts();
         }, this.config.updateInterval);
         this.getHistoryicalFacts(this.config.initialLoadDelay);
         var self = this;
     },

     getHistoricalFacts: function() {
         this.sendSocketNotification('GET_HISTORICALFACTS', this.url);
     },

     socketNotificationReceived: function(notification, payload) {
         if (notification === "HISTORICALFACTS_RESULT") {
             this.processHistoricalFacts(payload);
             if(this.rotateInterval == null){
			   	this.scheduleCarousel();
			   }
               this.updateDom(this.config.animationSpeed);
         }
         this.updateDom(this.config.initialLoadDelay);
     },

      getDom: function() {
         
         var HistoricalFacts = this.HistoricalFacts;
         moment.locale(this.locale);

         var wrapper = document.createElement("div");
         wrapper.className = "wrapper";
         wrapper.style.maxWidth = this.config.maxWidth;
         
         var header = document.createElement("header");
         header.classList.add("xsmall", "bright", "header");
         header.innerHTML = "Today in History  " + moment().format('L');
         wrapper.appendChild(header);
         
          var hkeys = Object.keys(this.HistoricalFacts);
			if(hkeys.length > 0){
           	if(this.activeItem >= hkeys.length){
				this.activeItem = 0;
			}
         var history = this.HistoricalFacts[hkeys[this.activeItem]];

         var top = document.createElement("div");
         top.classList.add("content");

         var hitem = document.createElement("p");
         hitem.classList.add("xsmall", "bright", "title");
		 if (this.config.maxLength && this.config.maxLength < HistoricalFacts.title.toString().length) {
			hitem.innerHTML = HistoricalFacts.title.toString().substring(0, this.config.maxLength) + "\u2026";			 
		 } else {
			hitem.innerHTML = HistoricalFacts.title;
		}
         top.appendChild(hitem);

         wrapper.appendChild(top);
         }
         return wrapper;
     },
 });
