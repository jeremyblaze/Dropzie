(function($){
$.fn.dropzie = function(settingsOverrides){

    // options

        var settings = $.extend({
            // this is the list of all available options and their defaults
            'search': true,
            'hideFirstOptionFromList': true, // use this if your first option is 'Select...' or similar
            'customToggle': null // css selector for a custom trigger/button you'd like to use to open the menu – if set the standard trigger will be hidden
       }, settingsOverrides);
       
       var rootMenu = $(this);
       
       var multiSelect = false;
       if ( $(rootMenu).attr('multiple') ) multiSelect = true;
       
       var callback = settings.change;
           
    // basic setup

        $(rootMenu).hide();

        // if no options selected, make the first one selected
        if ( !$(rootMenu).find('option[selected]').length ) {
           $(rootMenu).find('option:first-child').attr('selected', '1');
        }

        // get options as an array
        var options = [];
        $(rootMenu).find('option').each(function(i){
            var selected = false;
            if ( $(this).attr('selected') ) var selected = true;
            options.push({
                'label': $(this).html(),
                'value': $(this).attr('value'),
                'html': $(this).attr('data-html'),
                'selected': selected
            });
        });

        // get currently selected options and create label
        var label = '';
        var selected = [];
        $.each(options, function(i, opt){
           if ( opt['selected'] == true ) {
               label = label + opt['label'] + ', ';
               selected.push(opt);
           }
        });
        var label = label.slice(0, -2);
        
        var dr = $('<div class="dropzie" tabindex="0"></div>');
        
        if ( settings.customToggle ) {
            $(dr).append('<button class="dropzieToggle" style="display:none;">'+label+'</button>');
        } else {
            $(dr).append('<button class="dropzieToggle">'+label+'</button>');
        }

        var drList = $('<div class="dropzieList"></div>');
        $.each(options, function(i, opt){
           if ( i == 0 && settings.hideFirstOptionFromList == true ) {
               // skip
           } else {
               if ( opt['html'] ) {
                   var label = opt['html'];
               } else {
                   var label = opt['label'];
               }
               $(drList).append('<div class="dropzieOption" data-value="'+opt['value']+'" data-selected="'+opt['selected']+'" data-label="'+opt['label']+'">'+label+'</div>');
           }
        });
        if ( settings.search ) {
            $(dr).append('<div class="dropzieMenu"><input type="text" class="dropzieSearch" placeholder="Search" />'+$(drList).html()+'</div>');
        } else {
            $(dr).append('<div class="dropzieMenu">'+$(drList).html()+'</div>');
        }

        $(rootMenu).after(dr);
        
        // update dropzie menu whenever root menu changes
        $(rootMenu).on('change', function(){
            
            $(dr).find('.dropzieOption[data-selected="true"]').each(function(){
                $(this).attr('data-selected', 'false');
            });
            
            $(rootMenu).find('option:selected').each(function(){
                var val = $(this).attr('value');
                $(dr).find('.dropzieOption[data-value="'+val+'"]').click();
            });
            
        });

    // interactions

        // open/close
        
            function dropzieOpen(){
                
                // close any other dropzies on page
                $('.dropzie').each(function(){
                    $(this).removeClass('active');
                    $(this).find('input').val('').blur();
                });
                
                // open this one
                $(dr).addClass('active');
                setTimeout(function(){
                    $(dr).find('input').focus();
                }, 10);
                
            }
            
            function dropzieClose(){
                $(dr).removeClass('active');
                $(dr).find('input').val('').blur();
            }
            
            // open/close on toggle click
            $(dr).find('.dropzieToggle').click(function(){
                if ( $(dr).hasClass('active') ) {
                    dropzieClose();
                } else {
                    dropzieOpen();
                }
            });
            $(settings.customToggle).click(function(e){
                e.preventDefault();
                if ( $(dr).hasClass('active') ) {
                    dropzieClose();
                } else {
                    dropzieOpen();
                }
            });
            
            // close if user clicks outside dropdown
            $(document).click(function(e){
                if ( !$(e.target).parents('.dropzie').length && $(e.target) && !$(e.target).parents(settings.customToggle) ) {
                    dropzieClose();
                }
            });
        
        // select/deselect options
        
            $(dr).find('.dropzieOption').click(function(){
                
                if ( multiSelect == false ) {
                    // when in single-select mode, you cannot deselect the selected item
                    $(dr).find('.dropzieOption[data-selected="true"]').attr('data-selected', 'false');
                }
                
                if ( $(this).attr('data-selected') == 'true' ) {
                    $(this).attr('data-selected', 'false');
                } else {
                    $(this).attr('data-selected', 'true');
                }
                
                if ( multiSelect == false ) {
                    // when in single-select mode, automatically close the menu
                    dropzieClose();
                }
                
                // update label
                
                    var label = '';
                    var selected = [];
                    $(dr).find('.dropzieOption[data-selected="true"]').each(function(){
                       if ( $(this).attr('data-selected') == 'true' ) {
                           label = label + $(this).attr('data-label') + ', ';
                       }
                    });
                    if ( label ) {
                        var label = label.slice(0, -2);
                    } else {
                        var firstOpt = $(rootMenu).find('option').first();
                        if ( $(firstOpt).attr('data-html') ) {
                            var label = $(firstOpt).attr('data-html');
                        } else {
                            var label = $(firstOpt).html();
                        }
                    }
                    $(dr).find('.dropzieToggle').html(label);
                
                // update root menu
                
                    $(rootMenu).find('option:selected').each(function(){
                        $(this).removeAttr('selected');
                    });
                    
                    $(dr).find('.dropzieOption[data-selected="true"]').each(function(){
                        var val = $(this).attr('data-value');
                        $(rootMenu).find('option[value="'+val+'"]').prop('selected', 'selected');
                    });
                    
                // callback
                
                    if ($.isFunction(callback)) {
                        callback.call();
                    }
                
            });
        
        // search
        
            var search = $(dr).find('.dropzieSearch');
            $(search).on('keyup', function(){
                var searchVal = $(this).val().toLowerCase();
                if ( searchVal.length > 0 ) {
                    $(dr).find('.dropzieOption').each(function(){
                        $(this).hide();
                        if ( $(this).html().toLowerCase().includes(searchVal) || $(this).attr('data-selected') == 'true' ) {
                            $(this).show();
                        } else {
                            $(this).hide();
                        }
                    });
                } else {
                    $(dr).find('.dropzieOption').show();
                }
            });
        
        // arrow keys
        
            $(document).on('keydown', function(e){
                if ( $(dr).hasClass('active') ) {
                    var max = $(dr).find('.dropzieOption.hov').length;
                    if ( e.which == 38 ) {
                        // up
                        if ( !$(dr).find('.dropzieOption.hov').length ) {
                            $(dr).find('.dropzieOption:last-of-type').addClass('hov');
                        } else {
                            var activeHovItem = $(dr).find('.dropzieOption.hov').index() + 1;
                            if ( activeHovItem == 1 ) {
                                var itemToSelect = max;
                            } else {
                                var itemToSelect = activeHovItem - 1;
                            }
                            $(dr).find('.dropzieOption.hov').removeClass('hov');
                            $(dr).find('.dropzieOption:nth-child('+itemToSelect+')').addClass('hov');
                        }
                    } else if ( e.which == 40 ) {
                        // down
                        if ( !$(dr).find('.dropzieOption.hov').length ) {
                            $(dr).find('.dropzieOption:first-of-type').addClass('hov');
                        } else {
                            var activeHovItem = $(dr).find('.dropzieOption.hov').index() + 1;
                            if ( activeHovItem == max ) {
                                var itemToSelect = 1;
                            } else {
                                var itemToSelect = activeHovItem + 1;
                            }
                            $(dr).find('.dropzieOption.hov').removeClass('hov');
                            $(dr).find('.dropzieOption:nth-child('+itemToSelect+')').addClass('hov');
                        }
                    } else if ( e.which == 13 ) {
                        $(dr).find('.dropzieOption.hov').click();
                    }
                }
            });
    
};
})(jQuery);
