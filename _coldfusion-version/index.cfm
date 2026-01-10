<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1">

	<!--- facebook / open graph --->
	<meta property="fb:app_id"				content="789598127818022"/>
	<meta property="og:type"                content="article"> 
	<meta property="og:url"                 content="http://www.josephadamvelez.com">
	<meta property="og:site_name"        	content="Joseph Adam Velez">
	<meta property="og:image" 				content="http://www.josephadamvelez.com/image/home-background.jpg"> 
	<meta property="og:title"               content="Portfolio & Resume for Joseph Adam Velez">
	<meta property="og:description"         content="The resume and portfolio website for Joseph Velez, a Front End Developer with skills in Bootstrap, HTML, CSS, JS, jQuery, AngularJS, RESTful Applications, PHP, ColdFusion, MySQL, MSSQL and more."> 
	<meta property="article:published_time" content="2015-11-07"> 
	<meta property="article:tag"            content="front end developer">


	<title>Resume & Portfolio for Joseph Adam Velez</title>
	<meta name='keywords' content='Front End Web Developer, Joe Velez, Joseph Velez, Bootstrap, HTML, CSS, JS, jQuery, AngularJS, PHP, ColdFusion, MySQL, MSSQL, REST, API, Applications' />
	<meta name='description' content='The resume and portfolio website for Joseph Velez, a Front End Developer with skills in Bootstrap, HTML, CSS, JS, jQuery, AngularJS, RESTful Applications, PHP, ColdFusion, MySQL, MSSQL and more.' />

	<!-- jQuery -->
	<script src='https://code.jquery.com/jquery-2.1.4.min.js'></script>

	<!-- star rating -->
	<!---
	<script src='/js/star-rating.min.js'></script>
	<link href='/css/star-rating.min.css' rel='stylesheet' />
	--->
	
	<!-- fancybox -->
	<!---
	<script src='/js/jquery.fancybox.pack.js'></script>
	<link href='/css/jquery.fancybox.css' rel='stylesheet' />
	--->

	<!-- flexslider -->
	<!---
	<script src='/js/jquery.flexslider-min.js'></script>
	<link href='/css/flexslider.css' rel='stylesheet' />
	--->

	<!-- Latest compiled and minified CSS -->
	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css" integrity="sha512-dTfge/zgoMYpP7QbHy4gWMEGsbsdZeCXz7irItjcC3sPUFtf0kuFbDz/ixG7ArTxmDjLXDmezHubeNikyKGVyQ==" crossorigin="anonymous">

	<!-- Optional theme -->
	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap-theme.min.css" integrity="sha384-aUGj/X2zp5rLCbBxumKTCw2Z50WgIr1vs/PFN4praOTvYXWlVyh2UtNUU0KAUhAX" crossorigin="anonymous">

	<!-- Latest compiled and minified JavaScript -->
	<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js" integrity="sha512-K1qjQ+NcF2TYO/eI3M6v8EiNYZfA95pQumfvcVrTHtwQVDG+aHRqLi/ETn2uB+1JqwYqVG3LIvdm9lj6imS/pQ==" crossorigin="anonymous"></script>

	<!-- font awesome -->
	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css">

	<!-- custom styles -->
	<link href='/css/style.css' rel='stylesheet' />

	<!-- font -->
	<link href='https://fonts.googleapis.com/css?family=Poiret+One' rel='stylesheet' type='text/css'>

	<!-- custom scripts -->
	<script src='/js/nav.js'></script>
	<script src='/js/intro-jumbotron.js'></script>
	<script src='/js/skills-rating.js'></script>	
	<script src='/js/portfolio.js'></script>
	<!---<script src='/js/resume.js'></script>--->
	<script src='/js/script.js'></script>

</head>
<body id='body'>

	<script>
	  window.fbAsyncInit = function() {
	    FB.init({
	      appId      : '789598127818022',
	      xfbml      : true,
	      version    : 'v2.5'
	    });
	  };

	  (function(d, s, id){
	     var js, fjs = d.getElementsByTagName(s)[0];
	     if (d.getElementById(id)) {return;}
	     js = d.createElement(s); js.id = id;
	     js.src = "//connect.facebook.net/en_US/sdk.js";
	     fjs.parentNode.insertBefore(js, fjs);
	   }(document, 'script', 'facebook-jssdk'));
	</script>

	<cfif CGI.HTTP_HOST contains 'local'>
		<div class='debug visible-xs'>xs</div>
		<div class='debug visible-sm'>sm</div>
		<div class='debug visible-md'>md</div>
		<div class='debug visible-lg'>lg</div>
	</cfif>
	<cfinclude template='nav.cfm' />
	<cfinclude template='intro.cfm' />
	<cfinclude template='about.cfm' />
	<cfinclude template='skills.cfm' />
	<cfinclude template='portfolio.cfm' />
	<cfinclude template='resume.cfm' />
	<cfinclude template='social.cfm' />
	<cfinclude template='contact.cfm' />
	<cfinclude template='modal.cfm' />

</body>
</html>