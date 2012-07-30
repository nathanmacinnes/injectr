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

Now when you `require('fs')` or `require('crypto')` in myScript.js, what you
get is `mockFs` or `mockCrypto`.

Treat **injectr** like `require` for your tests, with a second argument to pass
in your mocks. The only thing to note is that paths are relative to the
_working directory_, not to the file location as with `require`.

### Context ###

**injectr** gives you access to the context of the **injectr**'d file via
an optional third argument. Provide an object, and **injectr** will modify it
as necessary and use that as the context.

````javascript
var myScript = injectr('./lib/myScript.js', {}, {
    Date : mockDate,
    setTimeout : mockSetTimeout
});
````

As of version 0.4, **injectr** doesn't create a full node.js context for you to
use. Instead, it isolates your script in its own sandbox, allowing you to
include mocks of only the bits that your script needs.

### CoffeeScript ###

To use **injectr** with CoffeeScript, use the `onload` callback.

````javascript
var injectr.onload = function (file, content) {
    if (file.match(/\.coffee$/)) {
        return require('coffee-script').compile(content, { filename: file });
    }
    return content;
}
````

## Share it ##

**injectr** is under the [MIT License](http://www.opensource.org/licenses/MIT).
[Fork it](https://github.com/nathanmacinnes/injectr). Modify it. Pass it around.
