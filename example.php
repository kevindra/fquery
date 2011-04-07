<!doctype html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:fb="http://www.facebook.com/2008/fbml">
  <head>
    <script type='text/javascript' src='/src/fquery2.0.js'></script>
  </head>

  <body>
    <!-- FB Initialization -->
    <div id="fb-root"></div>
    <script>
      window.fbAsyncInit = function() {
        f.boot();  
      };

      (function() {
        var e = document.createElement('script'); e.async = true;
        e.src = document.location.protocol +
          '//connect.facebook.net/en_US/all.js';
        document.getElementById('fb-root').appendChild(e);
       
        /** Facebook Initialization **/ 
        f.init({
          appId: '< application ID >',
          channelUrl: 'http://' + document.location.host + '/src/channel.html',
          redirectUrl:  '< provide your application URL >'
        })

      }());

    </script>
    <!-- FB Initialization ends -->


    <div>
      <div id='profileinfo'></div>
    </div>
    <script>
      (function(){
        f.afterBoot(function(){
          var pdiv  = document.getElementById('profileinfo');

          //Get Basic Information
          f('me').exec(function(response){
            pdiv.innerHTML += "Name: " + response.name + "<br/>";
          })
  
          // Get Profile Picture  
          f('me').picture().exec(function(response){
            var response = response[0];
            pdiv.innerHTML += "<br/><img src='"+ response.pic +"'/>";
          })
        })
      }());
    </script>
  </body>
</html>
