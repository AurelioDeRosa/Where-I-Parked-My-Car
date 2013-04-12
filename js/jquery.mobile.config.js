$(document).on(
   'mobileinit',
   function()
   {
      // Default pages' transition effect
      $.mobile.defaultPageTransition = 'slide';

      // Page Loader Widget
      $.mobile.loader.prototype.options.textVisible = true;

      // Theme
      $.mobile.page.prototype.options.theme  = 'b';
      $.mobile.page.prototype.options.headerTheme = 'b';
      $.mobile.page.prototype.options.contentTheme = 'b';
      $.mobile.page.prototype.options.footerTheme = 'b';
      $.mobile.page.prototype.options.backBtnTheme = 'b';
   }
);