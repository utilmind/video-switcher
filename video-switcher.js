var videoSwitcher = {

   // config (filled with defaults)
   config: {
     id: "myvideo",
     rotate: false,
     vids: [],
   },

   // go
   init: function(options) {
     var me = this;
     // setup options (copy to config)
     if (options) {
       if (typeof options.id != "undefined")
         me.config.id = options.id;
       if (typeof options.rotate != "undefined")
         me.config.rotate = options.rotate;
       if (typeof options.vids != "undefined")
         me.config.vids = options.vids;
     }

     var evid = document.getElementById(me.config.id);
     if (!evid) {
       console.error("Video element not found: " + me.config.id);
       return;
     }

     // go
     var activeVideo, nextVideo, nextVideoChecked, previds = [], has_controls,
         int_video_id = me.config.id + "-video", // make new unique ID for video
         firstIndex = activeVideo = me.curVideoIndex(0); // immediately choose index of video to play

     // AK: don't set permanent "loop" attribute. We can't change the video in this case, since "ended" event will never triggered.
     evid.innerHTML = '<video autoplay muted preload="auto" id="'+int_video_id+'" style="width:100%"><source src="'+me.config.vids[firstIndex].file+'" type="video/mp4" /></video>';
     evid = document.getElementById(int_video_id);
     evid.addEventListener("loadedmetadata", function(e) {
           if (typeof $!="undefined") { // only with jQuery. Some animation to resize the video.
             var curHeight = $(this).height();
             $(this).css("height", "auto");
             var autoHeight = $(this).height();
             if (curHeight != autoHeight)
               $(this).height(curHeight).animate({height: autoHeight}, 200, function() { $(this).css("height", ""); }); // animate to certain height, but still keep it responsive after an animation.
           }
         });
     // <video>.
     evid.addEventListener("timeupdate", function(e) {
           if (/*!nextVideoChecked &&*/ this.currentTime > this.duration/2) { // more than half of the video
             //nextVideoChecked = true;

             // Preload next video
             nextVideo = activeVideo+1 >= me.config.vids.length ? 0 : activeVideo+1; // rotate
             if (!me.config.rotate)
               nextVideo = me.curVideoIndex(nextVideo);

             if (!me.config.rotate) {
               var isLooped = this.getAttribute("loop");
               if (nextVideo == activeVideo) {
                 if (!isLooped) this.setAttribute("loop", true);
               }else {
                 if (isLooped) this.removeAttribute("loop");
               }
             }

             // it's not cached yet? (UPD. actually the first video should be cached too. We don't want it to be kicked out from page.)
             if (!previds[nextVideo] && (nextVideo != activeVideo)) { // && (nextVideo != firstIndex)) {
               var src = me.config.vids[nextVideo].file;
                   fetcher_id = me.config.id + "-fetch",
                   fetcher = document.getElementById(fetcher_id);

               if (fetcher)
                 document.body.removeChild(fetcher);

               // it doesn't worked in Chrome :( Maybe I did something wrong. But Ok, let's do it with <video>.
               // link = document.createElement("link");
               // link.rel = "preload";
               // link.as ="fetch";
               // link.href = src;
               // document.body.appendChild(link);

               fetcher = document.createElement("video");
               fetcher.style.display = "none";
               fetcher.muted = true;
               fetcher.preload = "auto";
               fetcher.id = fetcher_id;
               fetcher.innerHTML = '<source src="'+src+'" type="video/mp4" />';
               document.body.appendChild(fetcher);

               previds[nextVideo] = 1; // document.getElementById(src_id);
               // console.log("Preloading "+src); // debug
             }
           }
           if (!has_controls && (this.currentTime > 1)) {
             this.setAttribute("controls", true);
             has_controls = true;
           }
         });
     // <video>.
     evid.addEventListener("ended", function(e) { // end 
           nextVideoChecked = false;
           if (nextVideo != activeVideo) {
             var curHeight = this.clientHeight;

             this.src = me.config.vids[nextVideo].file;
             this.style.height = curHeight+"px"; // keep the height of the previous video to avoid jump. (And we must specify units, "px". Otherwise height will not set correctly.)
             activeVideo = nextVideo;
           }
           // update the video source and play
           this.removeAttribute("controls");
           has_controls = false;
           this.play(); // loop. (But don't set "loop" attribute to <video> because so we cannot switch videos.)
         });
   },

   curVideoIndex: function(def) {
     var vids = this.config.vids;

     if (vids.length && !this.config.rotate) {
       var date = new Date,
           cur_sec = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds(),
           total_duration = 0;

       // determinating duration of all videos.
       for (var i=0; i<vids.length; ++i)
         total_duration+= typeof vids[i].duration != "undefined" ? vids[i].duration : 1;

       cur_sec = cur_sec % total_duration;

       // get current video in second pass
       total_duration = 0;
       for (var i=0; i<vids.length; ++i) {
         total_duration+= typeof vids[i].duration != "undefined" ? vids[i].duration : 1;
         if (cur_sec < total_duration)
           return i;
       }
     }

     return def; // if nothing found. Impossible situation?
   },

}