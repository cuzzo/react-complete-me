React Complete Me
=================

React autocompletion powered by ElasticSearch. So easy your mom can do it.

Usage
-----

React Complete Me is an autocompletion framework built on [Facebook's React](http://facebook.github.io/react/ "React Homepage") and powered by [ElasticSearch](http://www.elasticsearch.org/ "ElasticSearch Homepage") It's built with the idea of customization in mind, and is easy to integrate.

Why is this helpful? ElasticSearch autocompletes faster than nearly anything you've thought of. It's got built-in features for fuzzy and metaphone autocomplete. It can ignore articles. Recognize snynoyms. The list goes on...

Dependencies
------------

* [Node & npm](https://github.com/joyent/node/wiki/Installation "Node Installation Guide") - If you don't have Node or npm installed, follow the link.
* [ElasticSearch](http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/setup.html "ElasticSearch Installation Guide") - If you don't have ElasticSearch installed, follow the link.

Prerequisite Knowledge
----------------------

React Complete Me gets its name from the ElasticSearch blogpost [You Complete Me](http://www.elasticsearch.org/blog/you-complete-me/ "ElasticSearch Autocompletion Example"). This `README` assumes knowledge of ElasticSearch. If you don't have any previous experience or knowledge, follow that guide. You'll be ElasticSearch-competent in 20 minutes.

Once you have ElasticSearch up and running, and an index and type to use for autocompletion, you can hook it into your web app.

Getting Started
---------------

```bash
git clone https://github.com/cuzzo/react-complete-me.git
```

To simplify things, you can simply edit `.src/app/jsx/suggestion.jsx`. Change the line:

```javascript
var _ELASTICSEARCH_ENDPOINT = "/api/suggest";
```

Set the enpoint to match your ElasticSearch endpoint. You're done. Sort of.

If you followed the You Complete Me guide correctly, ElasticSearch will respond with data like:

```json
{
  "_shards":{
    "total":5,
    "successful":5,
    "failed":0
  },
  "<your_type_here>":[
    {
      "text":"<your_autocomplete_querystring_here>",
      "offset":0,
      "length":36,
      "options":[
        {
          // ...
        }
      ]
    }
  ]
}
```

The default implementation of React Complete Me requires your ElasticSearch endpoint to return *ONLY* the array of `<your_type_here>.options`. You need to have some bridge between ElasticSearch and ReactCompleteMe that returns this data. Additionally, React Complete Me only sends a querystring `?q=user+search+string+here` to this endpoint. You need to take that string, hit ElasticSearch, and return *ONLY* `<your_type_here>.options`.

Once you have this bridge on your website, and you've changed the `_ELASTICSEARCH_ENDPOINT` to match that bridge, build the React Complete Me distributable:

```bash
grunt dist
```

Pop `./dist/react-complete-me.js` onto a page somewhere (preferably link `./src/css/suggest.css` for default styling).

This default implementation of React Complete Me depends on an html element, preferably a div, on the page:

```html
<div id="react-complete-me"></div>
```

Obviously, it's easy to change this.

Custom Features
---------------

React Complete Me abstracts the hard part of autocompletion. It's designed so that UI changes are easy.

The only publicly exposed function of React Complete Me is, in this repository, in `./src/main.js`. It is `Completer.conect()` (defined in `./src/app/jsx/completer.jsx`).

```jsx
/**
 * Creates an autocompleter and connects it to the DOM.
 *
 * @param Element $el
 *   A DOM element.
 * @param object Suggestion
 *   An object implementing the Suggestion interface.
 * @param function on_submit
 *   A submit callback.
 */
Completer.connect = function($el, Suggestion, on_submit) {
  React.renderComponent(
    <Completer Suggestion={Suggestion} on_submit={on_submit} />,
    $el
  );
};
```

The first and third parameters are self explanitory. `$el` is the DOM element into which the autocompleter will be appended. `on_submit` is a function to call when the user chooses an ElasticSearch suggestion or otherwise submits the search string.

The second argument, `Suggestion` is an object that implements the Suggestion Interface, which--in this repository--is the default Suggestion Interface, located at `./src/app/jsx/suggestion.jsx`.

This interface consists of three callbacks:

* `GET` - A function that hits ElasticSearch and returns the `<your_type_here>.options` of the ElasticSearch response.
* `keep_cache` - A function which determines whether to hit ElasticSearch, or continue using the previous response.
* `suggestion_filterer` - A function which filters the ElasticSearch suggestions while the user inputs additional characters--but before a new ElasticSearch response has been returned (that matches the current user input).

And finally, the suggestion interface implements a React component: 

* `Components.Suggestion` - A React component to render each individual suggestion that displays under the autocomplete searchbar.

That's it.

An (im)Practical example
------------------------

Okay, I know what you're all wanting to do is, to change the autocomplete bar to show an image of say, Titanic--the movie poster, when autocomplete results come back for the string `ti` in your movie database app.

Well, I'm not going to show you how to get Kate Winslet and Leo in your search bar, but I will show you how easy it is to display the phrase "Want a pizza?" before every suggestion.

Edit `./src/app/suggestion.jsx` and change `Suggestion.Components.Suggestion` to look something like:

```jsx
/**
 * The individual suggestions of the ReactCompleteMe auto-completer.
 *
 * props:
 *   name -> fieldname.
 *   text -> ElasticSearch autocomplete response text.
 *   score -> ElasticSearch autocomplete response score.
 *   payload -> ElasticSearch autocomplete response payload.
 *   set_suggestion -> callback: set the searchbar to this suggestion.
 */
Suggestion.Components.Suggestion = React.createClass({
  render: function() {
    return (
      <option
          name={this.props.name}
          onClick={this.props.set_suggestion}>
        <span class="useless-information">Want a pizza?</span>
        <span class="useful-information">{this.props.text}</span>
      </option>
    );
  }
});
```

Removing [Superagent](https://github.com/visionmedia/superagent "Superagent Homepage") Dependency
-------------------------------------------------------------------------------------------------

Let's say you already have `jQuery` in your application, and you don't want to require `Superagent` just to make a request to ElasticSearch. Fair enough.

Just replace the `GET` function in `./src/app/jsx/suggestion.jsx` to something like:

```javascript
/**
 * Callback to hit ElasticSearch.
 *
 * @param string q
 *   The current querystring/filter.
 * @param function cb
 *    A node-style callback function (fed error, response).
 */
Suggestion.GET = function(q, cb) {
  jQuery
    .get(_ELASTICSEARCH_ENDPOINT, {q: q})
    .done(function(resp) { 
      cb(null, resp.text);
    })
    .fail(function(err) {
      cb(err);
    });
};
```

Roadmap
-------

* v0.1.1: Better support for static autocompletion.
* v0.1.2: Better example. better default CSS.
* v0.1.3: Include example node bridge app between ElasticSearch and React Complete me.
* v0.1.4: Github pages for documentation of the Suggestion interface / a better explanation of the suggestion interface.
* v0.1.5: Inlcude Dockerfile for ElasticSearch, as well as an example ElasticSearch index, to better demonstrate functionality.
* v0.1.6: Remove dependency on AMD / make it easier to use CommonJS or other frameworks.

Other Resources
---------------

* [Facebook React Tutorial](http://facebook.github.io/react/docs/tutorial.html "Facebook React Tutorial") - In case you've decided upon this autocompletion library, but haven't learned to React yet.
* [You Complete Me](http://www.elasticsearch.org/blog/you-complete-me/ "ElasticSearch autocompletion Example") - If you didn't read this earlier, read it! You really can't use this library without setting up ElasticSearch accordingly.

License
-------

React Complete Me is free--as in BSD. Hack your heart out, hackers.
