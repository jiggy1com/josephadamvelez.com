// requires jQuery
var navModule = (function(){

	var DEFAULTS = {
		init : function(){		
			var aElements = $('#navList');
			aElements.each(function(){
				$(this).children().children().click(function(e){
					e.preventDefault();
					var element = $(this);
					var el = $(element);
					var scrollToElement = $('#'+el.attr('href'));
					// mobile
					if( $(window).width() < 768 ){
						// close menu
						$('.navbar-toggle').click();						
						// delay is to give time for the menu to close completely (helps w/ the math below)
						setTimeout(function(){
							$('html, body').animate({
								scrollTop : scrollToElement.offset().top - $('#nav').height()
							}, 500, 'linear');
						}, 400);					
					}else{
						// desktop
						$('html, body').animate({
							scrollTop : scrollToElement.offset().top - $('#nav').height()
						}, 500, 'linear');
					}					
				});
			});
		}
	}

	// document.ready()
	document.addEventListener("DOMContentLoaded", function(event) {
		DEFAULTS.init();
	});

	return DEFAULTS

}());