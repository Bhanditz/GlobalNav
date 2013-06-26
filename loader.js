var globalNav = function(){
    
    var topBar         = false;
    var topBarSections = [];

    var initCSS = function(config){
    	$.each(config.stylesheets, function(i, stylesheet){
        	$('head').append('<link rel="stylesheet" href="' + stylesheet + '"/>');    		
    	});
    };
    
    var initHtml = function(config){
    	var nav = $('<nav class="top-bar container">').prependTo('body');
	        
        nav.append(
             '<ul class="title-area">'
          +    '<li class="name">'
          +      '<h1><a href="#">a</a></h1>'
          +    '</li>'
          +    '<li class="toggle-topbar menu-icon"><a href="#"><span></span></a></li>'
          + '</ul>'
        );
	        
        var topBar      = $('<section class="top-bar-section">').appendTo(nav);
        var topBarLeft  = $('<ul class="left">').appendTo(topBar);
        var topBarRight = $('<ul class="right">').appendTo(topBar);

        topBarLeft.append('<li class="divider"></li>');
        
		$.each(config.row1.left, function(key, val) {				
	        topBarLeft.append('<li class="divider"></li>');
	        topBarLeft.append('<li><a href="#">' + val + '</a></li>');
		});

		topBarRight.append('<li class="divider"></li>');

		$.each(config.row1.right, function(key, val){
			topBarRight.append('<li class="divider"></li>');
			
	        if(typeof val == 'string'){
	        	topBarRight.append('<li><a href="#">' + val + '</a></li>');		        	
	        }
	        else if(typeof val == 'object'){
		        var menu = $('<ul class="dropdown">').appendTo(
			       $('<li class="has-dropdown"><a href="#">' + val.title + '</a></li>')
			       .appendTo(topBarRight)		        		
		        );
	        		
	        	$(val.items).each(function(i, ob){
	        		menu.append('<li><a href="#">' + ob + '</a></li>');
	        	});
	        }
		});
		
    };
    
    var initJS = function(config){
    	var recursiveLoad = function(index){
 		   if(config.scripts[index]){
 	          $.getScript(config.scripts[index], function(){
            	recursiveLoad(index + 1);        		   
 	          }).fail(function(jqxhr, settings, exception) {
 	        	console.log( "Error: " + exception );
 	          });
 		   }
       	   else{
     	      $(document).foundation();
       	   }
    	};
    	recursiveLoad(0);   	
    }
    
    return {
    	init: function(data){
  		  initCSS(data.css);
          initHtml(data.html);
          initJS(data.js);
    	},
        load:function(config){
        	$(document).ready(function(){
        		$.getJSON(config + "?callback=?")
        		  .fail(
        		    function(e){
        		      console.log( "Config error [" + config + "]: " + e.statusText + "  " + JSON.stringify(e) );
        		    }
        		  );
        	});
        }
    }
}();

