(function(){

	DEFAULTS = {

		init : function(){
			$('.rating').each(function(){
				
				$(this).css({
					display : 'inline-block'
				});

				for(var i=0;i<5;i++){
					if( $(this).attr('data-value') > i){
						$(this).append("<span class='fa fa-star rating-selected'></span>");	
					}else{
						$(this).append("<span class='fa fa-star rating-not-selected'></span>");
					}					
				}

			});
		}

	}

	// document.ready()
	document.addEventListener("DOMContentLoaded", function(event) { 
		DEFAULTS.init();
	});	

	return DEFAULTS
}());