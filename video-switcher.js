if (typeof myvid != "undefined")
  (function() {
    var activeVideo = 0, previds = [], has_controls;

    myvid.addEventListener("loadedmetadata", function(e) {
      if (!$(this).is(":visible")) {
        $(this).fadeIn(200);

      }else {
        var curHeight = $(this).height();
        $(this).css("height", "auto");
        var autoHeight = $(this).height();
        if (curHeight != autoHeight)
          $(this).height(curHeight).animate({height: autoHeight}, 200, function() { $(this).css("height", "auto"); }); // animate to certain height, but still keep it responsive after an animation.
      }
    });

    myvid.addEventListener('timeupdate', function(e) {
      if (myvid.currentTime > myvid.duration/2) { // more than half of the video
        // Preload video
        var nextVideo = activeVideo+1 >= myvids.length ? 0 : activeVideo+1;
        if (typeof previds[nextVideo] == "undefined") {
          var src = myvids[nextVideo],
              src_id = "vid-preload-" + src.replace(/[^\dA-Za-z_\-]/, "");

          $("body").append('<video muted preload="auto" id="'+src_id+'" style="display:none"><source src="'+src+'" type="video/mp4" /></video>');
          previds[nextVideo] = 1; // document.getElementById(src_id);
          // console.log("Preloading "+src);
        }
      }
      if (!has_controls && (myvid.currentTime > 1))
        $(myvid).prop('controls', has_controls = true)
    });

    myvid.addEventListener("ended", function(e) {
      // update the new active video index
      activeVideo = (++activeVideo) % myvids.length;
      // console.log('active: '+activeVideo + ' = '+myvids.length);

      var curHeight = $(myvid).height();
      // update the video source and play
      $(myvid).prop("controls", has_controls = false)
      myvid.src = myvids[activeVideo];
      $(myvid).css("height", curHeight); // keep the height of the previous video to avoid jump
      myvid.play();
    });
  })();
