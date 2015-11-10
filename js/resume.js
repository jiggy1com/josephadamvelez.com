// requires jQuery
var resumeModule = (function(){

	var DEFAULTS = {

		init : function(){		

			$('#resume .btn').click(function(e){
				e.preventDefault();
				// create an iframe which will force the browser to download the document
				$('<iframe>', { 
		        	src: '/resume.cfm?download=true&doc=Joe-Velez-Resume-2016-Resume-Only-Detailed.pdf'
		    	}).appendTo('body').hide();
			});

		}

	}

	// document.ready()
	document.addEventListener("DOMContentLoaded", function(event) { 
		DEFAULTS.init();
	});	

	return DEFAULTS

}());