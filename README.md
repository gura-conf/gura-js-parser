# Gura Javascript/Typescript parser

This repository contains the implementation of a [Gura][gura] (compliant with version 1.0.0) format parser for Javascript written in pure Typescript.


## Installation

```sh
# NPM
npm install gura --save

# Yarn
yarn add gura

# Bower
bower install gura --save
```


## Usage

```typescript
import { parse, dump } from 'gura';

const guraString = `
# This is a Gura document.
title: "Gura Example"

an_object:
    username: "Stephen"
    pass: "Hawking"

# Line breaks are OK when inside arrays
hosts: [
    "alpha",
    "omega"
]`

// Parse: transforms a Gura string into a dictionary
const parsedGura = parse(guraString)
console.log(parsedGura) // {title: 'Gura Example', an_object: {'username': 'Stephen', 'pass': 'Hawking'}, hosts: ['alpha', 'omega']}

// Access a specific field
console.log(`Title -> ${parsedGura['title']}`)

// Iterate over structure
for (const host of parsedGura['hosts']) {
    console.log(`Host -> ${host}`)
}

// Dump: transforms a dictionary into a Gura string
console.log(dump(parsedGura))
```

## Troubleshoot


### Module not found: Error: Can't resolve 'fs' (or 'path')

If you are using this library for the browser, there are some components like `path` or `fs` that are not available as you can not access the filesystem. If your code is not transpiling, you can try adding this block to your Webpack configuration:

```javascript
module.export = {
    // ...
    resolve: {
        // ...
        fallback: {
            fs: false,
            path: false
        }
    }
}
```


## Contributing

All kind of contribution is welcome! If you want to contribute just:

1. Fork this repository.
1. Create a new branch and introduce there your new changes.
1. Run `yarn check-all` (or `npm run check-all` with NPM). This command runs tests and linter to check that new changes are correct!
1. Make a Pull Request!

Or you can join to our [community in Discord][discord-server]!


### Tests

To run all the tests: `yarn test` or `npm run test`


## License

This repository is distributed under the terms of the MIT license.


[gura]: https://github.com/gura-conf/gura
[discord-server]: https://discord.gg/Qs5AXPQpKd
