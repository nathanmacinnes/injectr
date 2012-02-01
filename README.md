# injectr #

Finally, a solution to node.js dependency injection

## Use it ##

````javascript
var injectr = require('injectr');
var myScript = injectr('./lib/myScript.js', {
    fs : mockFs,
    crypto : mockCrypto
});
````

Now when myScript.js `require`s `fs` or `crypto`, what it gets is `mockFs` or
`mockCrypto`. It works with relative requires too. Just make sure you make the
property name exactly the same as what is required in the file.

Treat **injectr** like `require` for your tests, with a second argument to pass
in your mocks.

## Install it ##

`npm install injectr`. Boom.

