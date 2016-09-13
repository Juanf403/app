angular.module('your_app_name.app.services', [])

.service('AuthService', function ($http, $q, localStorageService){
  
  this.getLoggedUser = function(){  
    var datos = localStorageService.get('datos');

    if (datos){
      return datos;
    } else {
      $state.go("facebook-sign-in");
    }
  };

})

.service('Categorias', function ($http, $q){

  this.getCategorias = function(){
    var dfd = $q.defer();

    $http.get(servidor+"categorias.php").then(function( response ){
      var categorias = response.data;
      dfd.resolve(categorias);
    });

    return dfd.promise;
  };

  this.getSubcategorias = function(catid){
    var dfd = $q.defer();

    $http.get(servidor+"subcategorias.php?catid="+catid).success(function(response) {
      var subcategorias = response;
      dfd.resolve(subcategorias);
    });

    return dfd.promise;
  };

})

.service('ProfileService', function ($http, $q){

  this.getUserData = function(userId){
    var dfd = $q.defer();

    $http.get(servidor+"perfil.php?id="+userId).success(function(database) {
      dfd.resolve(database[0]);
    });

    return dfd.promise;
  };

  this.getUserFollowers = function(userId){
    var dfd = $q.defer();

    $http.get('database.json').success(function(database) {
      var followers_data = _.filter(database.following, function(follow){ return follow.followsId == userId });

      //remove possible duplicates
      var followers_userId = _.uniq(_.pluck(followers_data, 'userId'));

      var followers = _.map(followers_userId, function(followerId){
        return {
          userId: followerId,
          userData: _.find(database.users, function(user){ return user.id == followerId }),
          follow_back: !_.isUndefined(_.find(database.following, function(user){ return (user.userId === userId && user.followsId === followerId) }))
        }
      });

      dfd.resolve(followers);
    });
    return dfd.promise;
  };

  this.getUserFollowing = function(userId){
    var dfd = $q.defer();

    $http.get('database.json').success(function(database) {
      var following_data = _.filter(database.following, function(follow){ return follow.userId == userId });
      //remove possible duplicates
      var following_userId = _.uniq(_.pluck(following_data, 'followsId'));

      var following = _.map(following_userId, function(followingId){
        return {
          userId: followingId,
          userData: _.find(database.users, function(user){ return user.id == followingId })
        }
      });
      dfd.resolve(following);
    });

    return dfd.promise;
  };

  this.getUserPictures = function(userId){
    var dfd = $q.defer();

    $http.get('database.json').success(function(database) {
      //get user related pictures
      var user_pictures = _.filter(database.users_pictures, function(picture){
        return picture.userId == userId;
      });

      dfd.resolve(user_pictures);
    });

    return dfd.promise;
  };

  this.getUserPosts = function(userId){
    var dfd = $q.defer();

    $http.get('database.json').success(function(database) {
      //get user related pictures
      var user_post = _.filter(database.posts, function(post){
        return post.userId == userId;
      });

      dfd.resolve(user_post);
    });

    return dfd.promise;
  };



})



.service('FeedService', function ($http, $q){

  this.getFeed = function(page){

    var pageSize = 5, // set your page size, which is number of records per page
        skip = pageSize * (page-1),
        totalPosts = 1,
        totalPages = 1,
        dfd = $q.defer();

    $http.get(servidor+"publicaciones.php").success(function(database) {
      /*
      totalPosts = database.posts.length;
      totalPages = totalPosts/pageSize;

      var sortedPosts =  _.sortBy(database.posts, function(post){ return new Date(post.date); });

      var postsToShow = sortedPosts.slice(skip, skip + pageSize);

      //add user data to posts
      var posts = _.each(postsToShow.reverse(), function(post){
        post.user = _.find(database.users, function(user){ return user.id == post.userId; });
        return post;
      });
      */

      dfd.resolve({
        posts: database,
        totalPages: totalPages
      });
    });

    return dfd.promise;
  };

  this.getFeedByCategory = function(page, categoryId, subcategoryId){
    var pageSize = 5, // set your page size, which is number of records per page
        skip = pageSize * (page-1),
        totalPosts = 1,
        totalPages = 1,
        dfd = $q.defer();

    //$http.get('database.json').success(function(database) {
    $http.get(servidor+"publicaciones.php?catid="+categoryId+"&subid="+subcategoryId).success(function(database) {
      /*
      totalPosts = database.length;
      totalPages = totalPosts/pageSize;

      var sortedPosts =  _.sortBy(database, function(post){ return new Date(post.date); });

      if(subcategoryId){
        sortedPosts = _.filter(sortedPosts, function(post){ return post.id == subcategoryId; });
      }

      var postsToShow = sortedPosts.slice(skip, skip + pageSize);

      //add user data to posts
      var posts = _.each(postsToShow.reverse(), function(post){
        post.user = _.find(database.users, function(user){ return user.id == post.userId; });
        return post;
      });
      */

      dfd.resolve({
        posts: database,
        totalPages: totalPages
      });
    });

    return dfd.promise;
  };

  this.getFeedByTrend = function(page, trendId){

    var pageSize = 5, // set your page size, which is number of records per page
        skip = pageSize * (page-1),
        totalPosts = 1,
        totalPages = 1,
        dfd = $q.defer();

    $http.get('database.json').success(function(database) {

      totalPosts = database.posts.length;
      totalPages = totalPosts/pageSize;

      var sortedPosts =  _.sortBy(database.posts, function(post){ return new Date(post.date); });

      if(trendId){
        sortedPosts = _.filter(sortedPosts, function(post){ return post.trend.id == trendId; });
      }

      var postsToShow = sortedPosts.slice(skip, skip + pageSize);

      //add user data to posts
      var posts = _.each(postsToShow.reverse(), function(post){
        post.user = _.find(database.users, function(user){ return user.id == post.userId; });
        return post;
      });

      dfd.resolve({
        posts: posts,
        totalPages: totalPages
      });
    });

    return dfd.promise;
  };

  this.getPostComments = function(post){
    var dfd = $q.defer();

    $http.get('database.json').success(function(database) {
      var comments_users = database.users;
      // Randomize comments users array
      comments_users = window.knuthShuffle(comments_users.slice(0, post.comments));

      var comments_list = [];
      // Append comment text to comments list
      comments_list = _.map(comments_users, function(user){
        var comment = {
          user: user,
          text: database.comments[Math.floor(Math.random()*database.comments.length)].comment
        };
        return comment;
      });

      dfd.resolve(comments_list);
    });

    return dfd.promise;
  };

  this.getPost = function(postId){
    var dfd = $q.defer();

    $http.get(servidor+"publicacion.php?id="+postId).success(function(database) {
      console.log(database)
      dfd.resolve(database[0]);
    });

    /*
    $http.get('database.json').success(function(database) {


      var post = _.find(database.posts, function(post){
        return post.id == postId;
      });

      post.user = _.find(database.users, function(user){ return user.id == post.userId; });

      console.log(post)
      dfd.resolve(post);
    });
*/

    return dfd.promise;
  };

})

.service('PeopleService', function ($http, $q){

  this.getPeopleSuggestions = function(){

    var dfd = $q.defer();

    $http.get('database.json').success(function(database) {

      var people_suggestions = _.each(database.people_suggestions, function(suggestion){
        suggestion.user = _.find(database.users, function(user){ return user.id == suggestion.userId; });

        //get user related pictures
        var user_pictures = _.filter(database.users_pictures, function(picture){
          return picture.userId == suggestion.userId;
        });

        suggestion.user.pictures = _.last(user_pictures, 3);

        return suggestion;
      });

      dfd.resolve(people_suggestions);
    });

    return dfd.promise;
  };

  this.getPeopleYouMayKnow = function(){

    var dfd = $q.defer();

    $http.get('database.json').success(function(database) {

      var people_you_may_know = _.each(database.people_you_may_know, function(person){
        person.user = _.find(database.users, function(user){ return user.id == person.userId; });
        return person;
      });

      dfd.resolve(people_you_may_know);
    });

    return dfd.promise;
  };
})


.service('TrendsService', function ($http, $q){
  this.getTrends = function(){
    var dfd = $q.defer();

    $http.get('database.json').success(function(database) {
      dfd.resolve(database.trends);
    });

    return dfd.promise;
  };

  this.getTrend = function(trendId){
    var dfd = $q.defer();

    $http.get('database.json').success(function(database) {
      var trend = _.find(database.trends, function(trend){ return trend.id == trendId; });
      dfd.resolve(trend);
    });

    return dfd.promise;
  };
})

.service('CategoryService', function ($http, $q){
  this.getCategories = function(){
    var dfd = $q.defer();

    $http.get('database.json').success(function(database) {
      dfd.resolve(database.categories);
    });

    return dfd.promise;
  };

  this.getSubCategories = function(categoryId){
    var dfd = $q.defer();
    $http.get('database.json').success(function(database) {
      var subcategories = database.categories[categoryId].subcategories;
      dfd.resolve(subcategories);
    });

    return dfd.promise;
  };

  this.getCategory = function(categoryId){
    var dfd = $q.defer();

    $http.get('database.json').success(function(database) {
      var category = _.find(database.categories, function(category){ return category.id == categoryId; });
      dfd.resolve(category);
    });

    return dfd.promise;
  };
})


.service('GooglePlacesService', function($q){
  this.getPlacePredictions = function(query)
  {
    var dfd = $q.defer();
    var service = new google.maps.places.AutocompleteService();

    service.getPlacePredictions({ input: query },
      function(predictions, status){
        if (status != google.maps.places.PlacesServiceStatus.OK) {
          dfd.resolve([]);
        }
        else
        {
          dfd.resolve(predictions);
        }
      });
    return dfd.promise;
  }
})


;
