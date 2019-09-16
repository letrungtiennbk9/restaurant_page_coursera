$(function(){
  $(".navbar-toggler").blur(function(){
    var screenWidth = window.innerWidth;
    if(screenWidth < 768){
      $("#navbarSupportedContent").collapse("hide");
    }
  });
});

(function(global){
  var dc = {};

  var homeHtml = "snippet/home-snippet.html";
  var allCategoriesUrl = "https://davids-restaurant.herokuapp.com/categories.json";
  var categoriesTitle = "snippet/categories-title-snippet.html";
  var category = "snippet/category-snippet.html";
  var singleCategoryUrl = "https://davids-restaurant.herokuapp.com/menu_items.json?category=";
  var singleCatTitleUrl = "snippet/single-categories-title-snippet.html";
  var singleCatItemUrl = "snippet/single-categories-item-snippet.html";
  var specialCategoriesTitleUrl = "snippet/special-categories-title.html";
  var specialCategoriesContentUrl = "snippet/special-categories-content.html";

  function insertHTML(selector, htmlCode){
    var element = document.querySelector(selector);
    element.innerHTML = htmlCode;
  };

  var showLoading = function (selector) {
    var html = "<div class='text-center'>";
    html += "<img src='images/ajax-loader.gif'></div>";
    insertHTML(selector, html);
  };

  var insertProperty = function(string, propertyName, propertyValue){
    var a = "{{" + propertyName + "}}";
    string = string.replace(new RegExp(a, "g"), propertyValue);
    return string;
  }

  dc.loadMenuCategories = function(){
    enableActiveStatus("menu-nav-button");
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(allCategoriesUrl, buildAndShowCategoriesHTML);
  };

  function buildAndShowCategoriesHTML(categoriesJson){
    $ajaxUtils.sendGetRequest(categoriesTitle, function(categoriesTitleHtml){
      $ajaxUtils.sendGetRequest(category, function(categoryHtml){
        var categoriesViewHtml = buildCategoriesViewHtml(categoriesJson, categoriesTitleHtml, categoryHtml);
        insertHTML("#main-content", categoriesViewHtml);
      },
      false);
    },
    false);
  };

  function buildCategoriesViewHtml(categoriesJson, categoriesTitleHtml, categoryHtml){
    var finalHtml = categoriesTitleHtml;
    finalHtml += "<section id='categories-section' class='row'>";
    
    for(var i = 0; i<categoriesJson.length; i++){
      var finalCategoryHtml = categoryHtml;
      var finalName = "" + categoriesJson[i].name;
      var finalShortName = "" + categoriesJson[i].short_name;
      finalCategoryHtml = insertProperty(finalCategoryHtml, "name", finalName);
      finalCategoryHtml = insertProperty(finalCategoryHtml, "short_name", finalShortName);
      finalHtml += finalCategoryHtml;
    }
    finalHtml += "</section>";
    return finalHtml;
  };

  dc.loadMenuItems = function(shortName){
    showLoading("#main-content");
    singleCategoryUrl += shortName;
    $ajaxUtils.sendGetRequest(singleCategoryUrl, function(singleCategoryJSON){
      $ajaxUtils.sendGetRequest(singleCatTitleUrl, function(singleCatTitleHtml){
        var finalHtml = singleCatTitleHtml;
        finalHtml = insertProperty(finalHtml,"name", singleCategoryJSON.category.name);
        finalHtml = insertProperty(finalHtml,"special_instructions", singleCategoryJSON.category.special_instructions);
        $ajaxUtils.sendGetRequest(singleCatItemUrl, function(singleCatItemHtml){
          finalHtml += "<section id='single-category-section' class='row'>";
          for(var i = 0; i < singleCategoryJSON.menu_items.length;i++){
            finalHtml += singleCatItemHtml;
            finalHtml = insertProperty(finalHtml,"cat_short_name",singleCategoryJSON.category.short_name);
            finalHtml = insertProperty(finalHtml,"item_short_name",singleCategoryJSON.menu_items[i].short_name);
            finalHtml = insertProperty(finalHtml,"item_price",singleCategoryJSON.menu_items[i].price_large);
            finalHtml = insertProperty(finalHtml,"item_name",singleCategoryJSON.menu_items[i].name);
            finalHtml = insertProperty(finalHtml,"item_description",singleCategoryJSON.menu_items[i].description);
          }
          finalHtml += "</section>";
          insertHTML("#main-content", finalHtml);
        },
        false);
      },
      false);
    });
  };

  var getRndInt = function(minVal, maxVal){
    return Math.floor(Math.random()*(maxVal - minVal + 1)) + minVal;
  }

  dc.loadSpecialCategories = function(){
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(allCategoriesUrl, function(allCategoriesJson){
      var rndIntArr = [];
      for(var i = 0;i<4;i++){
        do 
          var rndInt = getRndInt(0, allCategoriesJson.length);
        while(rndIntArr.indexOf(rndInt) != -1)

        rndIntArr.push(rndInt);
      }

      specialCategories = [];
      for(var i= 0;i<4;i++){
        specialCategories.push(allCategoriesJson[rndIntArr[i]]);
      }

      $ajaxUtils.sendGetRequest(specialCategoriesTitleUrl, function(specialCategoriesTitleHtml){
        var finalHtml = specialCategoriesTitleHtml;
        finalHtml += "<section id='single-category-section' class='row'>";
        finalHtml += insertHTML("#main-content",finalHtml);
        $ajaxUtils.sendGetRequest(specialCategoriesContentUrl, function(specialCategoriesContentHtml){
          for(var i = 0;i<4;i++){
            var categoryTile = specialCategoriesContentHtml;
            //var aaaaa = specialCategories;
            categoryTile = insertProperty(categoryTile, "short_name", specialCategories[i].short_name);
            categoryTile = insertProperty(categoryTile, "name", specialCategories[i].name);
            finalHtml += categoryTile;
          }
          finalHtml += "</section>";
          finalHtml += insertHTML("#main-content",finalHtml);
        },
        false);
      },
      false);
    });
  }

  function enableActiveStatus(navButtonToEnable){
    var classesOfButton = document.querySelector("#"+navButtonToEnable).className;
    if(classesOfButton.indexOf("active") == -1){
      document.querySelector("#" + navButtonToEnable).className += " active";
    }
  }

  document.addEventListener("DOMContentLoaded", function (event) {
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(
      homeHtml,
      function (responseText) {
        document.querySelector("#main-content")
          .innerHTML = responseText;
      },
      false);
    });

  global.$dc = dc;
})(window);
