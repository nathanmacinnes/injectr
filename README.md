# injectr #

_Finally, a solution to node.js dependency injection_

## Install it ##

`npm install injectr`. Boom.

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
property name exactly the same as what is required in the file being tested.

Treat **injectr** like `require` for your tests, with a second argument to pass
in your mocks. The only thing to note is that paths are relative to the
_working directory_, not to the file location as with `require`.

## Share it ##

**injectr** is under the [MIT License](http://www.opensource.org/licenses/MIT).
Pass it around. Or just link to https://github.com/nathanmacinnes/injectr/.