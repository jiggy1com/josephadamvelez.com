// requires jQuery
var scriptModule = (function(){

	var DEFAULTS = {

		init : function(){		
			
			$('#btn-contact').click(function(e){
				e.preventDefault();
				var element = $(this);

				$('.alert').hide();

				$(element).prepend("<span class='fa fa-spin fa-spinner'></span>");

				$.ajax({
					url : '/contact.cfm',
					method : 'POST',
					data : {
						send : true,
						name : $('#name').val(),
						email : $('#email').val(),
						phone : $('#phone').val(),
						message : $('#message').val()
					},
					dataType : 'json'
				})
				.success(function(data){
					$(element).children('span').remove();
					if(data.errorMsg != ''){
						$('.alert-danger').html(data.errorMsg).slideDown();
					}else{
						$('.alert-success').html(data.successMsg).slideDown();
						$('#name').val('');
						$('#phone').val('');
						$('#email').val('');
						$('#message').val('');
					}
				})
				.error(function(){
					$(element).children('span').remove();
					$('.alert-danger').html('An unknown error occurred.').slideDown();
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