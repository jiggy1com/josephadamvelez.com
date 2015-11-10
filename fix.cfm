<cfsetting requestTimeout='500' />

<cfset thisSize = 600 />

<cfset portfolioDir = #expandpath('./')# & 'image/portfolio/600/' />

<cfdirectory directory="#portfolioDir#" name='listDir' />

<cfloop query='listDir'>
	
	<cfset thisDir = portfolioDir & listDir.name />
	<cfdirectory name='listFiles' directory="#thisdir#" />

			<cfoutput>
			<h3>#listDir.name#</h3>
			</cfoutput>

	<cfloop query='listFiles'>
		<cffile action='rename' source='#thisdir#/#listFiles.name#' destination="#thisdir#/#thisSize#_#listFiles.currentRow#.png" />		
		<cfflush>
	</cfloop>
	<cfflush>
</cfloop>

done