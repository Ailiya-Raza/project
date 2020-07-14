import Search from "./model/Search.js";
import Recipe from "./model/Recipe.js";
import Likes from "./model/Likes.js";
import List from "./model/List.js";
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as likesView from './views/likesView';
import * as listView from './views/listView';
import { elements } from "./views/base";
const state = {};


const controlSearch = async () => {
  // 1) Get query from the view
  console.log("in search controller");
  const query = elements.searchInput.value;
  console.log(query);
  $(".recipeList").empty(); 

  if (query) {
    // 2) New Search Object and add to state
    state.search = new Search(query);

      await state.search.getResults();
      var e= state.search.result.recipes;
      const p1 = new searchView.Pagination(state.search.result.recipes, 5);
      var x=1;
      var p='';
      var v=-0;
      var numOfpages=searchView.renderPages(state.search.result.recipes);
      p1.display(1).forEach(searchView.renderRecipe);
      while (numOfpages>=x){
          p+=`<li value="${v}" class="pa"> ${x}</li>`;
          v+=1;
          x+=1;
      }

    $( `${p}` ).insertBefore(".pagination" );
    var nodes=document.getElementsByClassName("pa");
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].addEventListener ("click", (e) => {
        $(".recipeList").empty();
        p1.display(e.target.value+1).forEach(searchView.renderRecipe);


    })
    }  
  }
};

elements.searchForm.addEventListener("submit", e => {
    $(".pa").empty();
    controlSearch();
    e.preventDefault();
});


const recipeController = async () => {
  console.log("Entered Controller");

  var recipe_id = window.location.hash.replace('#', '');
  if (recipe_id) {
     
    state.recipe = new Recipe(recipe_id);

    try {
         await state.recipe.getRecipe(recipe_id);
         recipeView.displayRecipe(state.recipe);
         state.recipe.readIng();
    }

    catch(error) {
      alert("There was an error loading the recipe");
    }
  }
};

window.addEventListener('hashchange', e => {
  elements.s_list.innerHTML = '';
  recipeController();
});
let serve = 1;
const listController = async () => {
  if (!state.list) {
    state.list = new List();
  }
  const s =serve *4;
   elements.s_list.innerHTML = `<h4><i class="fas fa-users"> ${s} servings</i></h4><button class="add_list"><i class="fas fa-plus"></i></button><button class="min_list"><i class="fas fa-minus"></i></button><br>`;
  const ing = state.recipe.ingredients;
  ing.forEach(el => {
  		const c = el.count*serve;
        const item = state.list.addItem(c, el.unit, el.ingredient);
        listView.displayItem(item);
    });
}

const likeController = () => {
	console.log("Entered like controller");
	if (!state.likes) {
		state.likes = new Likes();
	}

	const current = state.recipe.id;
  	const c = state.likes.liked(current);
  	console.log(state.likes.liked(current));

	if (!state.likes.liked(current)) {
		// console.log('hello');
		state.likes.delLike(current);
		likesView.removeLike(current);

	}

	else {
		const title = state.recipe.title;
		const publisher = state.recipe.publisher;
		const image = state.recipe.image;

		const newLike = state.likes.addLike(current, title, publisher, image);
		likesView.likeDisplay(newLike);
	}

};


elements.recipe.addEventListener('click', e =>{
	console.log("entered event listener");
	if (e.target.matches('.fa-heart')) {
		likeController();
	}	
});
elements.recipe.addEventListener('click', e =>{
  console.log("entered list listener");
  if (e.target.matches('.fa-shopping-cart')) {
   

    listController();
  } 
});

elements.s_list.addEventListener('click', e =>{
  if (e.target.matches('.fa-plus')) {

    //document.querySelector('.fa-users').innerHTML = '';
    serve += 1;
    listController();
  } 
});
elements.s_list.addEventListener('click', e =>{
  if (e.target.matches('.fa-minus')) {
  	if(serve>0){
  		//document.querySelector('.fa-users').innerHTML = '';
  		serve -= 1;
  		listController();
  	}
  } 
});


window.addEventListener('load', () => {
	state.likes = new Likes();
	state.likes.reload();
	state.likes.likes.forEach(like => likesView.likeDisplay(like));
});
