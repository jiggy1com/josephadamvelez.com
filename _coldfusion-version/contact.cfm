<cfif NOT isDefined("send")>
	
<article id='contact'>
	<section>		
		<div class='container'>
			<div class='row'>
				<div class='col-xs-12 col-sm-12 col-md-12 col-lg-12'>
					<h1>Contact</h1>
				</div>
			</div>
			<div class='row'>
				<div class='col-xs-12 col-sm-12 col-md-5 col-lg-5 text-center'>
					<img src='//verysecurewebsite.r.worldssl.net/websites/josephadamvelez.com/image/contact/joseph-adam-velez.png' class='img-responsive' />
					<div class="btn-group" role="group" aria-label="photo-contact-box">
						<a class="btn btn-warning" href="tel:714-814-0109">Call</a>
						<a class="btn btn-warning" href="sms:714-814-0109">Text</a>
						<a class="btn btn-warning" href="mailto:josephadamvelez@gmail.com">Email</a>						
					</div>
				</div>
				<div class='col-xs-12 col-sm-12 col-md-7 col-lg-7'>

					<div class='alert alert-danger'></div>
					<div class='alert alert-success'></div>

					<form id='contactForm' onsubmit='return false;'>

						<div class='form-group'>
							<label>Name</label>
							<input type='text' class='form-control' id='name' name='name'>
						</div>

						<div class='form-group'>
							<label>Phone</label>
							<input type='text' class='form-control' id='phone' name='phone'>
						</div>

						<div class='form-group'>
							<label>Email</label>
							<input type='email' class='form-control' id='email' name='email'>
						</div>

						<div class='form-group'>
							<label>Message</label>
							<textarea class='form-control' id='message' name='message'></textarea>
						</div>

						<button class='btn btn-warning' id='btn-contact'>
							Submit
						</button>

					</form>

				</div>
			</div>
<!--- 			<div class='row'>
				<div class='col-xs-12 col-sm-12 col-md-12 col-lg-12 text-center'>
					<div
					  class="fb-like"
					  data-share="true"
					  data-width="450"
					  data-show-faces="true">
					</div>
				</div>
			</div> --->
		</div>
	</section>
</article>

<cfelse>

	<cfset returnThis 				= {} />
	<cfset returnThis['errorMsg'] 	= '' />
	<cfset returnThis['successMsg'] = '' />

	<cftry>

		<cfif NOT isDefined('form.name') OR form.name eq ''>
			<cfthrow type='validation' message='Name is a required field.' />
		</cfif>

		<cfif NOT isDefined('form.phone') OR form.phone eq ''>
			<cfthrow type='validation' message='Phone is a required field.' />
		</cfif>

		<cfif NOT isDefined('form.email') OR form.email eq ''>
			<cfthrow type='validation' message='Email is a required field.' />
		</cfif>

		<cfif NOT isDefined('form.message') OR form.message eq ''>
			<cfthrow type='validation' message='Message is a required field.' />
		</cfif>

		<cfmail to='josephadamvelez@gmail.com' from='joe@ibuildyoursite.com' subject='Contact Form from JosephAdamVelez.com' type='html'>
			<p>Message Received:</p>
			<p>Name: #form.name#</p>
			<p>Phone: #form.phone#</p>
			<p>Email: #form.email#</p>
			<p>Message: #form.message#</p>
		</cfmail>

		<cfmail to='#form.email#' from='joe@ibuildyoursite.com' subject='Your Contact Form from JosephAdamVelez.com' type='html'>
			<p>Message Received:</p>
			<p>Name: #form.name#</p>
			<p>Phone: #form.phone#</p>
			<p>Email: #form.email#</p>
			<p>Message: #form.message#</p>
		</cfmail>

		<cfset returnThis['successMsg'] = 'Your message has been received!' />

		<cfcatch type='any'>
			<cfset returnThis['errorMsg'] = cfcatch.message />
		</cfcatch>

	</cftry>



	<cfoutput>#serializeJson(returnThis)#</cfoutput>

</cfif>