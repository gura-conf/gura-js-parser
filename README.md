# Gura Javascript/Typescript parser &middot; [![Build Status](https://travis-ci.com/jware-solutions/gura-js-parser.svg?token=WzSyj6zPAyX1GUKsoSAG&branch=main)](https://travis-ci.com/jware-solutions/gura-js-parser)

This repository contains the implementation of a [Gura][gura] format parser for Javascript written in pure Typescript.


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


## Contributing

All kind of contribution is welcome! If you want to contribute just:

1. Fork this repository.
1. Create a new branch and introduce there your new changes.
1. Make a Pull Request!


### Tests

To run all the tests: `yarn test` or `npm run test`

[gura]: https://github.com/jware-solutions/gura


## Licence

This repository is distributed under the terms of the MIT license.