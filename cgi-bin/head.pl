#!/usr/bin/perl
print "Content-type: text/html\n\n";

print '<!doctype html>';
print '  <html>';
print '    <head>';
print '      <script type="text/javascript" src="http://', $ENV{'SERVER_NAME'}, '/scripts/jquery-1.8.1.js"></script>';
print '      <script type="text/javascript" src="http://', $ENV{'SERVER_NAME'}, '/scripts/GlobalNav2.js"></script>';
print '      <script type="text/javascript">';
print '         globalNavServer ="http://', $ENV{'SERVER_NAME'}, '";';
print '      </script>';
print '    </head>';
print '    <body>';


my @paramStrings = split(/\?/,$ENV{QUERY_STRING});

if( scalar @paramStrings eq 1){

	$url = @paramStrings[0];
	$url =~ s/url=/\.\.\//;
	
	open(INF, $url);
	@pageData = <INF>;
	close(INF);
	print @pageData;

	my @paths = split(/\//,@paramStrings[0]);

	if( scalar @paths gt 1){
		print '      <script type="text/javascript">';
		print '        globalNav.load("http://global-nav/conf/', @paths[1], '/config2.json");';	
		print '      </script>';
	}
}
print '    </body>';
print '</html>';

