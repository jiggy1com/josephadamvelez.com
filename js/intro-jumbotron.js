var jumbotronModule = (function(){

	// resize jumbotron when window is resized
	if(window.attachEvent) {
		// IE
		window.attachEvent('onresize', function() {
			DEFAULTS.init();
		});
	}
	else if(window.addEventListener) {
		// CHROME
		window.addEventListener('resize', function() {
			DEFAULTS.init();
		}, true);
	}
	else {
		//The browser does not support Javascript event binding
	}

	var DEFAULTS = {
		init : function(){		
			var navbar  		= $('#nav');
			var jumbotron 		= $('#intro .jumbotron');
			var navbarHeight 	= $(navbar).height();
			var windowHeight 	= $(window).height();
			var jumbotronWidth 	= $(window).width();
			var jumbotronHeight = windowHeight - navbarHeight;
			
			$(jumbotron).css({
				height : jumbotronHeight,
				width : jumbotronWidth
			});

			// wrapper
			$('.intro-wrapper').css({
				top:  $(jumbotron).find('h1').position().top,
				height: $(jumbotron).find('h1').outerHeight() + $(jumbotron).find('h2').outerHeight() + $(jumbotron).find('h3').outerHeight() + 90
			});
			

		}
	}

	// document.ready()
	document.addEventListener("DOMContentLoaded", function(event) { 
		DEFAULTS.init();
	});	

	return DEFAULTS

}());