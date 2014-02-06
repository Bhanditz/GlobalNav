#!/usr/bin/perl
print "Content-type: text/html\n\n";
print "Hello, World.<br/>"; 
print  $ENV{'DOCUMENT_ROOT'};
print "<br>"; 
print  $ENV{'PATH'};
print "<br>";


open(INF,"../conf/1418/config2.json");

@json = <INF>;

close(INF);

print @json;

#or dienice("Can't open survey.out: $!");



