var globalNav = function(){

	var origConfig = false;
	var href       = window.location.href;

	// set locale
	var locale = href.match(/([?&])locale=[a-z]{2}/);
	locale = locale && locale.length ? locale[0].split('=')[1] : 'en';
	
	// clean href
	href = href.match(/[?]/) ? href.split('?')[0] : href;
	

    var topBarSections = [];

    // load all css
    var initCSS = function(config){
    	$.each(config.stylesheets, function(i, stylesheet){
        	$('head').append('<link rel="stylesheet" href="' + stylesheet + '"/>');    		
    	});
    };
    
    var initHtml = function(config){
    	
    	var nav = $('<nav class="eu-global-nav">').prependTo('body');
        
    	// Left - Right floats

        var topBarLeft  = $('<div class="left">').appendTo(nav);
        var topBarRight = $('<div class="right">').appendTo(nav);
        
        var buildMenu = function(cmp, conf){
        	var menu = $(''
        	+ '<div class="global-nav-menu-bar"' + (conf.url ? ' href="' + conf.url + '"' : '')  + '>'
        	+   '<div class="menu-bar-inner">'
        	+     '<a title="Show more" class="back-item">Back...</a>'
        	+     '<div class="more" style=""></div>'
        	+     '<a title="Show more" class="more-item">More...</a>'
        	+     '</div>'
        	+   '</div>'
    	    + '</div>'
        	).appendTo(cmp);
        	menu = menu.children('.menu-bar-inner');
        	menu = menu.children('.more');

        	$(conf.items).each(function(i, ob){        		
        		menu.before('<a title="' + ob.label[locale] + '" ' + (ob.url ? 'href="' + ob.url + '"' : '') + ' class="menu-item"' + '>'
        			+ ob.label[locale]
        			+ '</a>');
        		if(ob.menu){
        			menu.before('<div class="section"></div>');
        			buildMenu(menu.prev('.section'), ob);
        		}});
        };
        
        
		// Left
		$.each(config.left, function(key, val) {
	        if(typeof val == 'object' && val.menu){
        		buildMenu(topBarLeft, val);
	        }
	        // topBarLeft.append(divider());
		});


		// Right
		/*
		$.each(config.right, function(key, val){
			
			//topBarRight.append(divider());
			
	        if(typeof val == 'string'){
	        	topBarRight.append('<li><a href="#">' + val + '</a></li>');		        	
	        }
	        else if(typeof val == 'object'){
	        	buildMenu(topBarRight, val, "vMenu", 0);
	        }
		});
		*/
    	//alert("end inithtml");
		
    	if(config.pulldown){
    		var pullDown       = $('<div class="pull-down closed"><ul></ul></div>').prependTo('body');
    		pullDown.after('<div class="opener-wrapper"><a class="opener">a</a></a>');
    		
    		
        	var pullDownList = pullDown.children('ul');
        	if(config.pulldown.items){
            	
            	$.each(config.pulldown.items, function(i, ob){
            		pullDownList.append('<li><a ' + (ob.url ? 'href="' + ob.url + '" ' : '') + '>' + ob.label[locale] + '</a></li>')
            	});        		
        	}
        	
			$('.opener-wrapper>.opener').click(function(){
				var pullDown = $('.pull-down');
				
				if(pullDown.hasClass('closed')){
					pullDown.removeClass('closed');
					pullDown.addClass('opened');
				}
				else{
					pullDown.removeClass('opened');
					pullDown.addClass('closed');					
				}
				
			});
    	}

		
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
       		   var menuConfig = {
       				/*
					"fn_init": function(self){
					}
					,"fn_item":function(self, selected){
						//alert("fn_item");
					}
					*/
				};
       		   
       		    $('.eu-global-menu').each(function(){
       		    	new EuGlobalMenu($(this), menuConfig).init();
       		    });
       		    
       		    // new stuff
       		    
       			/* event debouncing () */
   		 		(function($,sr){

   		 			var debounce = function (func, threshold, execAsap) {
   		 				var timeout;
   		 				return function debounced () {
   		 					var obj = this, args = arguments;
   		 					function delayed () {
   		 						if (!execAsap)
   		 							func.apply(obj, args);
   		 							timeout = null;
   		 						};
   		 			
   		 						if (timeout){
   		 							clearTimeout(timeout);
   		 						}
   		 						else if (execAsap){
   		 							func.apply(obj, args);
   		 						}
   		 			
   		 						timeout = setTimeout(delayed, threshold || 100);
   		 					};
   		 				};
   		 		
   		 				// smartresize 
   		 				jQuery.fn[sr] = function(fn){	return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };
   		 				jQuery.fn['euScroll'] = function(fn){	return fn ? this.bind('scroll', debounce(fn)) : this.trigger(sr); };

   		 		})(jQuery,'euRsz');

       			var rootMenu = new EuMenuBar( $('.left > .global-nav-menu-bar'));
       			rootMenu.resize();

   		 		$(window).euRsz(function(){
   		 			rootMenu.resize();
   		 		});
   		 		
   		 		// set the active
   		 		//alert(href)
   		    	rootMenu.findActiveLeaf(href);
   		    	
   		    	
       	   }
    	};
    	recursiveLoad(0);   	
    }
    
    return {
    	init: function(data){
    	  origConfig = data;
  		  initCSS(data.css);
     	  initHtml(data.html);
          initJS(data.js);
    	},
        load:function(configUrl){
        	$(document).ready(function(){

        		$.getJSON(configUrl + "?callback=?")
	        		.fail(
	        		    function(e){
	              		   // console.log( "Config error [" + configUrl + "]: " + e.statusText + "  " + JSON.stringify(e) );
	        		    }
	        		);
        	});
        },
        getConf:function(){
        	return origConfig;
        }
    }
}();

