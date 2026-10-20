# Scan-and-Save-to-Client-Side-Storage

A demo which scans documents with [Dynamic Web TWAIN](https://www.dynamsoft.com/web-twain/overview/) and stores them in IndexedDB

[Online demo](https://magnificent-torrone-e94292.netlify.app/)


Demo video of scanning documents:


https://github.com/tony-xlh/Scan-and-Save-to-Client-Side-Storage/assets/112376616/c0c29c79-14ca-4ab2-85c3-4d7ae0158da6


Demo video of opening an existing document:



https://github.com/tony-xlh/Scan-and-Save-to-Client-Side-Storage/assets/112376616/8a7df5d0-678e-4018-9f58-f8431f9f1382



### Installation

```sh
npm install
```

### Start Dev Server

```sh
npm start
```

### Build Prod Version

```sh
npm run build
```

### Features:

- ES6 Support via [babel](https://babeljs.io/) (v7)
- JavaScript Linting via [eslint](https://eslint.org/)
- SASS Support via [sass-loader](https://github.com/jtangelder/sass-loader)
- Autoprefixing of browserspecific CSS rules via [postcss](https://postcss.org/) and [postcss-preset-env](https://github.com/csstools/postcss-preset-env)
- Style Linting via [stylelint](https://stylelint.io/)

When you run `npm run build` we use the [mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin) to move the css to a separate file. The css file gets included in the head of the `index.html`.
