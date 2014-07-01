$(document).ready(function() {
  App.initialize();
});

var App = {
  current_section: "home",
  section_speed: 200,
  app_url: "http://blip.myxotod.com/manifest.webapp",
  dots_per_row: 6,
  colors: {
    1: {
      color: "#d4d14b",
      sound: "sound01"
    },
    2: {
      color: "#41a94a",
      sound: "sound02"
    },
    3: {
      color: "#da70b0",
      sound: "sound03"
    },
    4: {
      color: "#5398c9",
      sound: "sound04"
    },
    5: {
      color: "#ca964f",
      sound: "sound05"
    },
    6: {
      color: "#cc523d",
      sound: "sound06"
    },
    7: {
      color: "#7329bb",
      sound: "sound07"
    },
    8: {
      color: "#59cb90",
      sound: "sound08"
    }
  },
  current_color: "",
  time_interval: "",
  time_max: 30,
  time_left: 0,
  score: 0,

  initialize: function() {
    this.bind_events();
    
    $("section.home")
      .css("left", "0%")
      .css("display", "block");

    this.colorize_headline();

    if (this.is_installed() == true) {
      $("section.home .btn-install").hide();
    }
  },

  bind_events: function() {
    $(document).on("click", ".btn-switch-section", function(e) {
      App.switch_section($(this).data("section"));
      e.preventDefault();
    });

    $(window).resize(function() {
      $("section.home h1").css("z-index", "1");
      $("section.home nav button").css("z-index", "1");
      $("section.play .time").css("z-index", "1");
    });

    $(document).on("click", ".btn-install", function(e) {
      App.install();
      e.preventDefault();
    });

    $(document).on("click tap", ".dot.active", function(e) {
      App.add_point();
      e.preventDefault();
    })
  },

  switch_section: function(section) {
    $("section." + this.current_section).animate({
      left: "-100%"
    }, this.section_speed, function() {
      $(this).hide().css("left", "100%");
    });

    $("section." + section).show().animate({
      left: "0%"
    }, this.section_speed);

    this.current_section = section;

    switch (this.current_section) {
      case "play":
        this.prepare_game();
      break;
    }
  },

  colorize_headline: function() {
    $("section.home h1 span:nth-child(1)").css("color", object_random(this.colors)["color"]);
    $("section.home h1 span:nth-child(2)").css("color", object_random(this.colors)["color"]);
    $("section.home h1 span:nth-child(3)").css("color", object_random(this.colors)["color"]);
    $("section.home h1 span:nth-child(4)").css("color", object_random(this.colors)["color"]);
    $("section.home nav .btn-play").css("color", object_random(this.colors)["color"]);
  },

  is_installed: function() {
    var request = navigator.mozApps.checkInstalled(this.app_url);
    request.onsuccess = function() {
      if (request.result) {
        return true;
      } else {
        return false;
      }
    };
    request.onerror = function() {
      console.log(this.error.message);
      return false;
    };
  },

  install: function() {
    var request = navigator.mozApps.install(this.app_url);
    request.onsuccess = function() {
      return true;
    };
    request.onerror = function() {
      console.log(this.error.name);
      return false;
    };
  },

  prepare_game: function() {
    var game = $("section.play .game");
    game.css("width", "80%");
    game.css("height", game.width() + "px");
    this.score = 0;
    this.time_left = this.time_max;

    $("section.play .game .grid").html("");
    $("section.play .score").html("000000");
    $("section.play .time *").css("background-color", "#333");
    $("section.play .time .time-top").css("width", "100%");
    $("section.play .time .time-right").css("height", "100%");
    $("section.play .time .time-bottom").css("width", "100%");
    $("section.play .time .time-left").css("height", "100%");

    var game_size = game.width();
    for (var r = 1; r <= this.dots_per_row; r++) {
      for (var c = 1; c <= this.dots_per_row; c++) {
        $("section.play .game .grid").append("<div class='dot'></div>");
      }
    }
    $("section.play .game .grid .dot").css("height", 100 / this.dots_per_row + "%");
    $("section.play .game .grid .dot").css("width", 100 / this.dots_per_row + "%");

    this.start_game();
  },

  start_game: function() {
    this.time_interval = setInterval("App.update_time()", 10);
    this.set_dot();
  },

  set_dot: function() {
    this.current_color = object_random(this.colors);
    var dots = "section.play .game .grid .dot";
    $(dots).removeClass("active").css("background-color", "transparent");
    var active = Math.floor((Math.random() * ($(dots).length - 1))+1);
    $(dots + ":eq("+active+")").addClass("active").css("background-color", this.current_color["color"]);
  },

  add_point: function() {
    this.play_sound(this.current_color["sound"]);
    this.vibrate(200);
    this.score++;
    var len = 6 - String(this.score).length;
    var output = "";
    for (var i = 1; i<=len; i++) {
      output += "0";
    }
    output += "<span>" + this.score + "</span>";
    $("section.play .score").html(output);
    $("section.play .score span").css("color", this.current_color["color"]);
    $(".time *").css("background-color", this.current_color["color"]);

    this.set_dot();
  },

  update_time: function() {
    if (this.time_left >= 0) {
      var step = this.time_max / 4;

      if (this.time_left <= (step * 1)) {
        var percent = this.time_left / step * 100;
        $(".time-left").css("height", percent + "%");
      }
      if (this.time_left > (step * 1) && this.time_left <= (step * 2)) {
        var percent = this.time_left / (step * 2) * 200 - 100;
        $(".time-bottom").css("width", percent + "%");
      }
      if (this.time_left > (step * 2) && this.time_left <= (step * 3)) {
        var percent = this.time_left / (step * 3) * 300 - 200;
        $(".time-right").css("height", percent + "%");
      }
      if (this.time_left > (step * 3) && this.time_left <= (step * 4)) {
        var percent = this.time_left / (step * 4) * 400 - 300;
        $(".time-top").css("width", percent + "%");
      }

      this.time_left -= 0.01;
    } else {
      this.end_game();
    }
  },

  play_sound: function(sound) {
    var audioElement = document.createElement('audio');
    audioElement.setAttribute('src', 'assets/sounds/' + sound + '.mp3');
    audioElement.setAttribute('type', 'audio/mp3');
    audioElement.setAttribute('autoplay', 'autoplay');

    //$.get();

    audioElement.addEventListener("load", function() {
      audioElement.play();
    }, true);
  },

  end_game: function() {
    clearInterval(this.time_interval);
    var rand_color = object_random(this.colors)["color"];

    $("section.gameover .score").html($("section.play .score").html());
    $("section.gameover .score span").css("color", rand_color);
    $("section.gameover .btn-play").css("color", rand_color);

    this.switch_section("gameover");
  },

  vibrate: function(ms) {
    if('vibrate' in navigator) {
      navigator.vibrate(ms);
    }
  }
};

function object_size(obj) {
  var size = 0, key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }
  return size;
}

function object_random(obj) {
  return obj[Math.ceil(Math.random() * object_size(obj))];
}