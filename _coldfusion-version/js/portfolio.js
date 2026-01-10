// requires jQuery
var navModule = (function(){

	var DEFAULTS = {

		data : [
			{
				folder : 'supsouthlaketahoe.com',
				siteName : "SUP South Lake Tahoe",
				description : "A stylish 5 page responsive brochure website for SUP rentals in Lake Tahoe.",
				technology : ['PHP', 'HTML', 'CSS', 'JS', 'jQuery', 'Bootstrap 3', 'Instagram API', 'WordPress', 'FancyBox'],
				images : 6
			},
			{
				folder : 'smallbizpro.net',
				siteName : "SmallBizPro",
				description : "SmallBizPro allows business owners to conveniently upload, store, and access their important organizational documents.",
				technology : ['ColdFusion', 'HTML', 'CSS', 'JS', 'jQuery', 'Bootstrap 3', 'AuthorizeNet API', 'YouTube API'],
				images : 15
			},
			{
				folder : 'nationsurfboards.com',
				siteName : "Nation Surfboards",
				description : "4 page brochure site for custom surfboard design. E-commerce provided by SquareUp.com.",
				technology : ['PHP', 'HTML', 'CSS', 'JS', 'jQuery', 'Bootstrap 2', 'Flexslider', 'Instagram API', 'Vimeo API'],
				images : 4
			},
			{
				folder : 'suplove.com',
				siteName : "SUP Love",
				description : "SUP Love is a boutique stand-up paddleboard (SUP) provider. Custom shopping cart with AuthorizeNet integration. Also implemented canada.suplove.com using a single source code.",
				technology : ['PHP', 'HTML', 'CSS', 'JS', 'jQuery', 'Bootstrap 2', 'WordPress', 'Custom WordPress CMS Plugin', 'Instagram API', 'Twitter Feed', 'AuthorizeNet API', 'Google Maps API'],
				images : 13
			},
			{
				folder : 'cookandeattheusa.com',
				siteName : "Cook and Eat the USA",
				description : "Chef Marla provides cooking classes with regional-based recipes. Online registration fees are processed through AuthorizeNet.",
				technology : ['PHP', 'HTML', 'CSS', 'JS', 'jQuery', 'Bootstrap 3', 'Custom CMS', 'AuthorizeNet API'],
				images : 11
			},
			{
				folder : 'nationmfg.com',
				siteName : "Nation Golf",
				description : "4 page brochure site for golf wear. E-commerce provided by SquareUp.com.",
				technology : ['PHP', 'HTML', 'CSS', 'JS', 'jQuery', 'Bootstrap 3', 'Large scaling video' ],
				images : 5
			},
			{
				folder : 'diversityinv.com',
				siteName : "Diversity Investigative Services",
				description : "5 page brochure site for Orange County's premier private investigative services. This site uses my proprietary site building technology wrapped with Bootstrap 3. Also implemented a custom UI for investigators to upload daily reports over HTTPS, and allow the site owner to update their clients on the status of their case. (not shown)",
				technology : ['ColdFusion', 'HTML', 'CSS', 'JS', 'jQuery', 'Bootstrap 2', 'Flexslider'],
				images : 5
			},
			{
				folder : 'kidsfurnituresuperstore.us',
				siteName : "Kids Furniture Superstore",
				description : "Kids Furniture Superstore provides Los Angeles residents a plethora of baby and kids furniture, over 4000 listed products. This site uses my proprietary site building technology wrapped with Bootstrap 3.",
				technology : ['ColdFusion', 'HTML', 'CSS', 'JS', 'jQuery', 'Bootstrap 3', 'Flexslider'],
				images : 7
			},
			{
				folder : 'kdsdiscount.com',
				siteName : "KDS Discount",
				description : "KDS Discount provides Los Angeles residents a plethora of baby and kids furniture, over 3000 listed products. E-commerce enabled. This site uses my proprietary site building technology wrapped with Bootstrap 3.",
				technology : ['ColdFusion', 'HTML', 'CSS', 'JS', 'jQuery', 'Bootstrap 3'],
				images : 6
			},
			{
				folder : 'babyfurnituresuperstore.us',
				siteName : "Baby Furniture Superstore",
				description : "Baby Furniture Superstore provides Los Angeles residents a plethora of baby furniture, over 3000 listed products. This site uses my proprietary site building technology wrapped with Bootstrap 3.",
				technology : ['ColdFusion', 'HTML', 'CSS', 'JS', 'jQuery', 'Bootstrap 3'],
				images : 4
			},


		],

		init : function(){		
			var template = this.getPortfolioItemTemplate();
			for(var i=0;i<DEFAULTS.data.length;i++){
				var html = template;
					html = html.replace(/{{i}}/g, i);
					html = html.replace(/{{folder}}/g, DEFAULTS.data[i].folder);
					html = html.replace(/{{siteName}}/g, DEFAULTS.data[i].siteName);
				$('#portfolio-items').append(html);
			}

			$('#portfolio-items a').click(function(e){
				e.preventDefault();
				DEFAULTS.loadModal(e);
			});

		},

		getPortfolioItemTemplate : function(){
			return "<div class='col-xs-6 col-sm-6 col-md-3 col-lg-3'>" +
						"<a href='#{{i}}' data-id='{{i}}'>" +
							"<img src='//verysecurewebsite.r.worldssl.net/websites/josephadamvelez.com/image/portfolio/{{folder}}/285_1.png' class='thumbnail'>" +
							"{{siteName}}" +
						"</a>" +												
					"</div>";
		},

		loadModal : function(e){
			var portfolioID = $(e.target).parent().attr('data-id');
			var portfolioItem = DEFAULTS.data[portfolioID];
			var modalInterior = this.getModalInteriorTemplate();
				modalInterior = modalInterior.replace(/{{folder}}/g, DEFAULTS.data[portfolioID].folder);
				modalInterior = modalInterior.replace(/{{description}}/g, DEFAULTS.data[portfolioID].description);
				modalInterior = modalInterior.replace(/{{website}}/g, DEFAULTS.data[portfolioID].folder);

			// technology array
			var technologyHTML = "<ul class='technology'>";
			for(var i=0;i<DEFAULTS.data[portfolioID].technology.length;i++){
				technologyHTML += "<li>" + DEFAULTS.data[portfolioID].technology[i] + "</li>";
			}
			technologyHTML += '</ul>';
			modalInterior = modalInterior.replace(/{{technology}}/g, technologyHTML);
			console.log('technologyHTML', technologyHTML);
			//modalInterior = modalInterior.replace(/{{technology}}/g, DEFAULTS.data[portfolioID].technology);

			// additional screen shots
			var additionalScreenShots = '';
			for(var i=1;i<=DEFAULTS.data[portfolioID].images;i++){
				var additionalScreenShotsTemplate = this.getModalAdditionalScreenShotsTemplate();
					additionalScreenShotsTemplate = additionalScreenShotsTemplate.replace(/{{folder}}/g, DEFAULTS.data[portfolioID].folder);
					additionalScreenShotsTemplate = additionalScreenShotsTemplate.replace(/{{i}}/g, i);
					additionalScreenShots += additionalScreenShotsTemplate;
			}
			modalInterior = modalInterior.replace(/{{additionalScreenShots}}/g, additionalScreenShots);

			$('#portfolioModal .modal-title').html(DEFAULTS.data[portfolioID].siteName);
			$('#portfolioModal .modal-body').html(modalInterior);
			$('#portfolioModal').modal('show');

			// fix click events on thumbnails
			$('#portfolioModal .fancybox').click(function(e){
				e.preventDefault();
				$('#portfolio-large').attr('src', $(this).attr('href'));
			});

			// // $('.fancybox').fancybox();

			// // clear slider
			// $('#flexsliderModal .slides').html('');
			// // fill slider
			// for(var i=1;i<=DEFAULTS.data[portfolioID].images;i++){
			// 	$('#flexsliderModal .slides').append("<li><img src='/image/portfolio/" + DEFAULTS.data[portfolioID].folder + "/" + i + ".png'></li>");
			// }
			// // initialize flexslider

			// $('#flexsliderModal').on('shown.bs.modal', function () {
			// 	DEFAULTS.initializeFlexslider();
			// });			
			
			// // fire up portfolio images modal
			// $('#portfolioModal .thumbnail').click(function(e){
			// 	e.preventDefault();
			// 	$('#flexsliderModal').modal('show');				
			// });
			return this;
		},

		initializeFlexslider : function(){
			$('.flexslider').flexslider({
				animation : 'slide'
			});
			return this;
		},

		getModalInteriorTemplate : function(){
			return "<div class='container-fluid'>"+ 
					    "<div class='row'>"+ 
					        "<div class='col-xs-12 col-sm-12 col-md-8 col-lg-8'>"+ 
					            "<img class='img-responsive' src='//verysecurewebsite.r.worldssl.net/websites/josephadamvelez.com/image/portfolio/{{folder}}/600_1.png' id='portfolio-large'>"+ 
					        "</div>"+ 
					        "<div class='col-xs-12 col-sm-12 col-md-4 col-lg-4'>"+ 
					            "<h3>Project Description</h3>"+ 
					            "<p>{{description}}</p>"+ 
								"<h3>Technology</h3>"+ 
					            "{{technology}}"+ 
					            "<p class='website'><a href='http://{{website}}' class='btn btn-warning btn-block' target='_blank'>View Website</a></p>"+ 
					        "</div>"+ 
					    "</div>"+ 
					    "<div class='row'>"+ 
					        "<div class='col-lg-12'>"+ 
					            "<h3 class='page-header'>Additional Screen Shots <!--<span class='help-block'>Click to Enlarge</span>--></h3>"+ 
					        "</div>"+ 
					        "{{additionalScreenShots}}"+
					    "</div>"+ 
					"</div>";
		},

		getModalAdditionalScreenShotsTemplate : function(){
			return "<div class='col-xs-6 col-sm-6 col-md-3 col-lg-3'>"+ 
			            "<a href='//verysecurewebsite.r.worldssl.net/websites/josephadamvelez.com/image/portfolio/{{folder}}/600_{{i}}.png' class='fancybox' rel='portfolio-fancybox'>"+ 
			                "<img class='img-responsive thumbnail' src='//verysecurewebsite.r.worldssl.net/websites/josephadamvelez.com/image/portfolio/{{folder}}/285_{{i}}.png'>"+ 
			                "<img class='offscreen' src='//verysecurewebsite.r.worldssl.net/websites/josephadamvelez.com/image/portfolio/{{folder}}/600_{{i}}.png'>"+ 
			            "</a>"+ 
			        "</div>";
		}

	}

	// document.ready()
	document.addEventListener("DOMContentLoaded", function(event) { 
		DEFAULTS.init();
	});	

	return DEFAULTS

}());