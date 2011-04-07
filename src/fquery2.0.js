/**
  * fquery.js
  * v2.0.0
  *
  * @desc: Very Easy and Flexible Facebook Features Access.
  * 
  * @author Kevindra Singh
  *
  * No dependencies.
  * 
  * Installation:
  *
  * Step 1: Loading Fquery
  *
  * Load the script in the head section of your HTML page:
  *
  *     <script type='text/javascript' src='fquery2.0.js'></script>
  *
  * Step 2: FB Initialization
  *
  * Initialize fQuery API, on document load: invoke this code:
  *
  * then, add following code snippet inside <BODY> tags.
  *
  * <!-- FB Initialization -->
    <div id="fb-root"></div>
    <script>
      (function() {
        var e = document.createElement('script'); e.async = true;
        e.src = document.location.protocol +
          '//connect.facebook.net/en_US/all.js';
        document.getElementById('fb-root').appendChild(e);

        f.init({
          appId: '< YOUR APP ID >',
          channelUrl: '<Channel File URL>',
          redirectUrl:  '<YOUR APP URL>',
          perms: '< Facebook APP permissions to ASK (optional)>'
        })
      }());
    </script>
    <!-- FB Initialization ends -->
  *
  *
  * Step 3: Boot the FB API. In your HTML <BODY> tag add following code:
  *
  * <script> 
  *   window.fbAsyncInit = function() {
  *     f.boot();
  *   }
  * </script>
  *
  * Now, you are cool to go ahead !!!!
  *
  * 
  * Usage examples:
  *
  * 1. Extracts user's basic info:
  * 
  * f('kevindra.singh').exec(function(response){
  *   //Play with response here.
  *   console.dir(response);
  * }); 
  *
  * 2. Extracts user's friend list:
  *
  * f('kevindra.singh').friends().exec(function(response){
  *   console.dir(response);
  * });
  *
  * 3. Get the Albums:
  * 
  * f('kevindra.singh).albums().exec(function(albums){
  *   //albums.
  * });
  *
  * 4.Get the photos from an album:
  *
  * //If you know the album ID, you can also invoke it like this
  * f('kevindra.singh').albums('<album id>').photos().exec(function(album){
  *   //album
  * });
  *
  * OR you can skip the user part as every object has unique IDs
  * 
  * f('<album id>').photos().exec(function(album){
  *   //album
  * });
  *
  * 5. Post on User's wall
  * 
  * f('user').wall().push({
        message: 'Hi I am FQuery.', 
        description: 'Author: Kevindra Singh.'
      }, 
      function(response){ 
        console.dir(response); 
      }
    );
  * 
  * References:
  * for popup http://nyromodal.nyrodev.com/
  *
  * Changes History
  *
  * v1.0: 
  *   Graph API support for 'user'
  *   Graph API write_stream support f('user').wall().push(...)
  * 
  * @todo for v2.0.0 (requirements)
  * 
  * 1. [DONE] FQL Support. f.exec(query,callback);
  * 2. [DONE] .afterBoot(callback) -- should be recursive to check in intervals.
  * 3. [DONE] MULTIPLE FQL query support. f.exec(queries obj, callback);
  * 4. [PENDING] Ask FB permissions only when they are required
  * 5. [NOT REQUIRED] Facebook Session Change Subscription on API BOOT
  * 6. [DONE] Event Queue Model[NOT required] OR Async Model for parallel graph API calls[IMPLEMENTED]
  * 7. [DONE] Installation time redirection to ask for permission, using JS.
  * 
  */
  
fQuery  = function(selector){
  return new _fQuery(selector);
}

/** Variables **/
fQuery.defaults = { 
  locale : 'en_US',
  appId: '', 
  status: true, 
  cookie: true, 
  xfbml: true,
  perms: ''
}

/** FB session object **/
fQuery.session = "";

/** FB API boot flag **/
fQuery.isBoot = false;

/** f.func(..) functions **/
/**
  * @func fQuery.init
  * Must be invoked on body load.
  * 
  * @params: JSON Object {
  *   locale/appId/status/cookie/xfbml/perms (indices) 
  * }
  */
fQuery.init  = function( params ){
  if(params == undefined) params = {};
  //Boot the FB API here.
  console.log('Initiating Facebook API...');
  fQuery.extend(fQuery.defaults, params);
  
  if(!fQuery.defaults.appId) { console.error('Please provide appId in fb.init function. Usage: f.init({appId: <your app id>}'); return NULL; }
  
  console.log('Finished Initiation.');

  return fQuery;
}

/**
  * @func fQuery.boot
  * Must be invoked in the script section :
  * window.fbAsyncInit  = function(){ ...//here//... } 
  * 
  * Boots the Facebook API for usage.
  */
fQuery.boot = function(){
  console.log('Booting FB API...');

  FB.init({
    appId: fQuery.defaults.appId, 
    status: fQuery.defaults.status, 
    cookie: fQuery.defaults.cookie, 
    xfbml: fQuery.defaults.xfbml,
    channelUrl: fQuery.defaults.channelUrl
  });

  FB.getLoginStatus(function(response){
    if(!response.session){
      var redirectUrl = encodeURIComponent(fQuery.defaults.redirectUrl);
      var loginUrl = 'https://www.facebook.com/dialog/oauth?client_id='+ fQuery.defaults.appId +'&redirect_uri='+ redirectUrl;
      if(fQuery.defaults.perms) loginUrl += "&scope="+jQuery.defaults.perms;
      top.location.href = loginUrl;
    }
    else{
      fQuery.session = FB.getSession();
      fQuery.isBoot = true;
    }
    console.log('Finished booting FB API.');
  });

  return fQuery;
}

/** extends two objects **/
fQuery.extend = function(obj1, obj2)  {
  if(obj2 == undefined) return obj1;
  for(idx in obj2) obj1[idx]  = obj2[idx];
  return obj1;
}

/**
  * @func .afterBoot
  * @desc All fQuery functions should be invoked after it's boot
  * e.g. 
  * f.afterBoot(function(){
  *   //do something here
  * })
  *
  * @param callback: A Callback function
  */
fQuery.afterBoot  = function(callback){
  if(fQuery.isBoot && fQuery.session) callback();
  else  window.setTimeout(fQuery.afterBoot, 1000, callback);
}

/**
  * @func .formatQuery
  * @desc Formats the selector query. Only accepts a-zA-Z0-9 and '.' and spaces 
  * @returns  Formatted selector. 
  */
fQuery.formatQuery = function(query) {
  if(!query || typeof query != 'string')  return null;

  query = query.replace(/^[\s]+/,'').replace(/[\s]+$/,'').replace(/[\s]{2,}/,' ');  //trimming spaces in both sides of query string
  query = query.replace(/[^a-zA-Z 0-9.]+/g,'');  //trimming non-alphanumeric letters
  querys  = query.split(' ');
  fquery  = "/";
  for(idx in querys)  {
    if(querys[idx]) fquery += querys[idx] + '/';
  }
  return fquery;
}

/**
  * @desc Grants Extended Permissions only when it is required.
  * @param perms: comma(,) seperated permissions for ex. "read_stream,publish_stream"
  * @param callback: function for callback. // it calls this function with response as 1/0 
  *   1: means permissions granted.
  *   0: means permissions denied.
  */
fQuery.grantPermissions = function(perms, callback){
  if(!perms) { callback(1); return; } //No permissions to ask for.

  fQuery.exec("SELECT "+ perms +" FROM permissions WHERE uid = me()",  function(response){
    var response = response[0];
    var reqdPerms = "";
    for(idx in response){
      if(response[idx] == 0){
        reqdPerms += "," + idx;
      }
    }
    if(!reqdPerms)
      callback(1);  // All permissions already granted. No need to ask for permissions
    else{ 
      //There are some permissions needed to be granted by the user. hence, call FB.login with extended permissions
      reqdPerms = reqdPerms.substr(1,reqdPerms.length-1);
      FB.login(function(response){
        if(response.perms || !reqdPerms){
          callback(1);
        } else  {
          callback(0);
        }
      }, {perms: reqdPerms});
    }
  });
}

/** to retrieve version **/
fQuery.v  = function(){
  return fQuery.version;
}

fQuery.version  = '2.0.0';

/** INNER FUNCTIONS START HERE **/

/** f('..').func(..) functions **/
_fQuery = function(selector){

  if(fQuery.isBoot  ==  false){
    console.error("f(..) called before f.boot(..).");
    return null;
  }

  /** Handle fQuery(""), fQuery(null) or fQuery(undefined) **/
  if(!selector) return _fQuery;
  
  if(typeof selector == "string"){
    _fQuery.selector  = fQuery.formatQuery(selector);
  }
  else{
    console.error("Invalid selector type, It can only be a string.");
    _fQuery.selector  = "";
  }

  return _fQuery;
}

/** selector **/
_fQuery.selector  = "";

/** permissions required to execute a query **/
_fQuery.perms = "";

/** isFQL flag **/
_fQuery.isFQL = false;

/** FQL (if required) **/
_fQuery.FQL = "";

_fQuery.albums  = function(selector){
  _fQuery.selector  +=  'albums/';
  
  if(_fQuery.perms) _fQuery.perms  +=  ',';
  _fQuery.perms += 'user_photos,friends_photos,user_photo_video_tags,friends_photo_video_tags';
  return _fQuery;
}

_fQuery.wall  = function(){
  _fQuery.selector += 'feed/';
  
  if(_fQuery.perms) _fQuery.perms +=  ',';
  _fQuery.perms  +=  'read_stream';

  return _fQuery;
}

_fQuery.email = function(){
  var user = _fQuery.selector.substr(1, _fQuery.selector.length - 2);
  _fQuery.isFQL = true;

  if(isNaN(user)){
    if(user == 'me') _fQuery.FQL  = "SELECT email FROM user WHERE uid = me()";
    else  _fQuery.FQL = "SELECT email FROM user WHERE username = '" + user + "'";
  }
  else  _fQuery.FQL = "SELECT email FROM user WHERE uid = " + user;
  
  if(_fQuery.perms) _fQuery.perms +=  ',';
  _fQuery.perms +=  'email';

  return _fQuery;
}

/** profile pic **/
_fQuery.picture  = function ()  {
  var user = _fQuery.selector.substr(1, _fQuery.selector.length - 2);
  _fQuery.isFQL = true;

  if(isNaN(user)){
    if(user == 'me') _fQuery.FQL  = "SELECT pic_square, pic_big, pic_small, pic  FROM user WHERE uid = me()";
    else  _fQuery.FQL = "SELECT pic_square, pic_big, pic_small, pic  FROM user WHERE username = '" + user + "'";
  }
  else  _fQuery.FQL = "SELECT pic_square, pic_big, pic_small, pic  FROM user WHERE uid = " + user;
  
  _fQuery.perms =  '';
  return _fQuery;
}

_fQuery.photos  = function ( pid ) {
  if(pid) _fQuery.selector = '/' + pid + '/';
  else _fQuery.selector  += 'photos/';
  
  if(_fQuery.perms) _fQuery.perms  +=  ',';
  _fQuery.perms += 'user_photos,friends_photos,user_photo_video_tags,friends_photo_video_tags';
  return _fQuery;
}

/** Friends (Array of friends as object) **/
_fQuery.friends = function ()  {
  _fQuery.selector +=  'friends/';
  _fQuery.perms = "";
  return _fQuery;
}

/** News Feeds (USER) **/
_fQuery.feed = function () {
  _fQuery.selector += 'home/';

  if(_fQuery.perms) _fQuery.perms +=  ',';
  _fQuery.perms  +=  'read_stream';

  return _fQuery;
}

/** Application Requests to User **/
_fQuery.apprequests = function()  {
  _fQuery.selector += 'apprequests/';
  _fQuery.perms = "";
  return _fQuery;
}

/** Get User's Accounts ( Pages/Applications etc) **/
_fQuery.accounts  = function () {
  _fQuery.selector += 'accounts/';

  if(_fQuery.perms) _fQuery.perms +=  ',';
  _fQuery.perms +=  'manage_pages';

  return _fQuery;
}

_fQuery.activities  = function(){
  _fQuery.selector  +=  'activities/';

  if(_fQuery.perms) _fQuery.perms +=  ',';
  _fQuery.perms +=  'user_activities,friends_activities';

  return _fQuery;
}

_fQuery.books = function(){
  _fQuery.selector  +=  'books/';
  
  if(_fQuery.perms) _fQuery.perms +=  ',';
  _fQuery.perms +=  'user_likes,friends_likes';

  return _fQuery;
}

_fQuery.checkins = function(){
  _fQuery.selector  +=  'checkins/';
  
  if(_fQuery.perms) _fQuery.perms +=  ',';
  _fQuery.perms +=  'user_checkins,friends_checkins';

  return _fQuery;
}

_fQuery.events = function(){
  _fQuery.selector  +=  'events/';
  
  if(_fQuery.perms) _fQuery.perms +=  ',';
  _fQuery.perms +=  'user_events,friends_events';

  return _fQuery;
}

_fQuery.friendlists = function(){
  _fQuery.selector  +=  'friendlists/';
  
  if(_fQuery.perms) _fQuery.perms +=  ',';
  _fQuery.perms +=  'read_friendlists,manage_friendlists';

  return _fQuery;
}

_fQuery.inbox = function(){
  _fQuery.selector  +=  'inbox/';
  
  if(_fQuery.perms) _fQuery.perms +=  ',';
  _fQuery.perms +=  'read_mailbox';

  return _fQuery;
}

_fQuery.interests = function(){
  _fQuery.selector  +=  'interests/';
  
  if(_fQuery.perms) _fQuery.perms +=  ',';
  _fQuery.perms +=  'user_interests,friends_interests';

  return _fQuery;
}

_fQuery.likes = function(){
  _fQuery.selector  +=  'likes/';
  
  if(_fQuery.perms) _fQuery.perms +=  ',';
  _fQuery.perms +=  'user_likes,friends_likes';

  return _fQuery;
}

_fQuery.links = function(){
  _fQuery.selector  +=  'links/';
  
  if(_fQuery.perms) _fQuery.perms +=  ',';
  _fQuery.perms +=  'read_stream';

  return _fQuery;
}

_fQuery.movies = function(){
  _fQuery.selector  +=  'movies/';
  
  if(_fQuery.perms) _fQuery.perms +=  ',';
  _fQuery.perms +=  'user_likes,friends_likes';

  return _fQuery;
}

_fQuery.music = function(){
  _fQuery.selector  +=  'music/';
  
  if(_fQuery.perms) _fQuery.perms +=  ',';
  _fQuery.perms +=  'user_likes,friends_likes';

  return _fQuery;
}

_fQuery.notes = function(){
  _fQuery.selector  +=  'notes/';
  
  if(_fQuery.perms) _fQuery.perms +=  ',';
  _fQuery.perms +=  'read_stream';

  return _fQuery;
}

_fQuery.outbox = function(){
  _fQuery.selector  +=  'outbox/';
  
  if(_fQuery.perms) _fQuery.perms +=  ',';
  _fQuery.perms +=  'read_mailbox';

  return _fQuery;
}

_fQuery.posts = function(){
  _fQuery.selector  +=  'posts/';
  
  if(_fQuery.perms) _fQuery.perms +=  ',';
  _fQuery.perms +=  'read_stream';

  return _fQuery;
}

_fQuery.statuses = function(){
  _fQuery.selector  +=  'statuses/';
  
  if(_fQuery.perms) _fQuery.perms +=  ',';
  _fQuery.perms +=  'read_stream';

  return _fQuery;
}

_fQuery.tagged = function(){
  _fQuery.selector  +=  'tagged/';
  
  if(_fQuery.perms) _fQuery.perms +=  ',';
  _fQuery.perms +=  'read_stream';

  return _fQuery;
}

_fQuery.television = function(){
  _fQuery.selector  +=  'television/';
  
  if(_fQuery.perms) _fQuery.perms +=  ',';
  _fQuery.perms +=  'user_likes,friends_likes';

  return _fQuery;
}

_fQuery.updates = function(){
  _fQuery.selector  +=  'updates/';
  
  if(_fQuery.perms) _fQuery.perms +=  ',';
  _fQuery.perms +=  'read_mailbox';

  return _fQuery;
}

_fQuery.videos = function(){
  _fQuery.selector  +=  'videos/';
  
  if(_fQuery.perms) _fQuery.perms +=  ',';
  _fQuery.perms +=  'user_videos,friends_videos';

  return _fQuery;
}

/**
  * @func exec
  * @desc This is only the function responsible to execute every kind of data access queries from facebook
  *
  * @param param1: it can be:
  *   1.  an object: Object of FQL queries (Multi Queries)  
  *     i.e. for f.exec({q1: 'query1', q2: 'query2'}, function(res){...})
  *   2.  a single string: One FQL query 
  *     i.e. for f.exec('FQL query', function(res){...}) 
  *   3.  a function: In case of non-FQL data access. 
  *     i.e. for f('me').album().exec(...) type of calls
  *
  * @param param2:
  *   This is set only when the function call is made for FQL queries.  
  *   A Callback function for getting the response from FQL queries.
  *
  * @param param3: Any forced permissions, only works in case of FQL Queries
  */
fQuery.exec = _fQuery.exec  = function(param1, param2, param3){

  /** GRAPH API CALL **/
  if(typeof param1 == 'function'){
    var callback = param1;
    var perms = _fQuery.perms;
    var selector  = _fQuery.selector;
    var isFQL = _fQuery.isFQL;
    var FQL = _fQuery.FQL;

    _fQuery.isFQL = false;
    _fQuery.FQL = _fQuery.perms = _fQuery.selector  = "";

    if(isFQL){
      fQuery.grantPermissions(perms, function(response){
        if(response){
          FB.api({
            method: 'fql.query',
            query:  FQL
          },
          function(response){
            callback(response);
          })
        }
        else console.warn('Permissions Denied. User did not grant permissions')
      })
    } 
    else{
      fQuery.grantPermissions(perms, function(response){
        if(response){
          FB.api(selector, function (response){
            callback(response)
          })
        }
        else{
          console.warn('Permissions Denied. User did not grant permissions.')
        }
      })
    }
  }
  /** FQL MULTIQUERY CALL **/
  else if(typeof param1 == 'object'){
    var query = param1;
    var callback  = param2;
    var forcePerms  = param3;
    
    fQuery.grantPermissions(forcePerms, function(response){
      if(response){
        FB.api({
          method: 'fql.multiquery',
          queries: query
        },
        function (response){
          if(response.error_code)
            console.error('Error: ' + response.error_code + ': ' + response.error_msg);
          else callback(response);
        })
      }
      else console.warn('Permissions Denied. User did not grant permissions.')
    })
  }
  /** FQL SINGLE QUERY CALL **/
  else if(typeof param1 ==  'string'){
    var query = param1;
    var callback  = param2;
    var forcePerms  = param3;
    
    fQuery.grantPermissions(forcePerms, function(response){
      if(response){
        FB.api({
          method: 'fql.query',
          query:  query
        },
        function(response){
          if(response.error_code)
            console.error('Error ' + response.error_code + ': ' + response.error_msg)
          else callback(response)
        }) 
      }
    })
  }

  return null;  //can't invoke any functions after exec
}

/**
  * @func push
  * @desc To post data on user's facebook wall.
  * 
  * @param  data: It is JSON format data object.
  *   default format is given in function itself.
  *
  * @param  callback: A callback function after execution.
  *
  * @todo Needs a lot of refinements. [WILL BE FIXED ON REQUIREMENT BASIS]
  */
_fQuery.push = function( data, callback  ) {
  var defaultContent  = {
    message: "",
    name  : "",
    link  : "",
    picture : "",
    description : ""
  };

  fQuery.extend(defaultContent, data);
  var selector  = _fQuery.selector;
  FB.api( selector, 'post', defaultContent, function (response)  {
    callback(response);
  });
  delete fQuery;
}

window.f  = fQuery;
