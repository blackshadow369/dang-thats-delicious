// const axios = require('axios');
import axios from 'axios'
import dompurify from 'dompurify'

function searchResultsHTML(stores){
    return stores.map(store=>{
        return `<a href="/store/${store.slug}" class="search__result">
            <strong>${store.name}</strong>
        </a>`;
    }).join('');
}

function typeAhead(search){
    // console.log(search);
    if(!search) return;
    const searchInput  = search.querySelector('input[name="search"]');
    const searchResults  = search.querySelector('.search__results');

    searchInput.on('input',function(){
        if(!this.value)
        {
            searchResults.style.display = 'none';
            return;
        }
        searchResults.style.display = 'block';
        searchResults.innerHTML = '';
        axios
        .get(`/api/search/?q=${this.value}`)
        .then(res=>{
            if(res.data.length){
                searchResults.innerHTML = dompurify.sanitize(searchResultsHTML(res.data));
                 //const html = searchResultsHTML(res.data);
                 //console.log(html);
                //console.log(searchResults.innerHTML);
                    return;
            }
            //no results found
                searchResults.innerHTML =dompurify.sanitize(`<div class="search__result">No search results for ${this.value} found!</div>`);
        }).catch(err=>{
            console.log(err);
        });

    });
      // handle keyboard inputs
  searchInput.on('keyup', (e) => {
    // only capture up, down or enter
    if (![38, 40, 13].includes(e.keyCode)) {
      return // nothing!
    }
    // need active class in variable
    const activeClass = 'search__result--active'
    const current = search.querySelector(`.${activeClass}`)
    // list all items
    const items = search.querySelectorAll('.search__result')
    let next
    if (e.keyCode === 40 && current) {
      next = current.nextElementSibling || items[0]
    } else if (e.keyCode === 40) {
      next = items[0]
    } else if (e.keyCode === 38 && current) {
      next = current.previousElementSibling || items[items.length - 1]
    } else if (e.keyCode === 38) {
      next = items[items.length - 1]
    } else if (e.keyCode === 13 && current.href) {
      window.location = current.href
      return
    }
    // add active class to next
    if (current) {
         current.classList.remove(activeClass)
    }
        next.classList.add(activeClass)
    });
}
export default typeAhead;