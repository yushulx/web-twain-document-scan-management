# Document Scanner

A desktop document scanner using Quasar/Vue/Electron.

[Dynamic Web TWAIN](https://www.dynamsoft.com/web-twain/overview/) is used for document scanning.

[Online demo](https://incredible-panda-481bc8.netlify.app/)

## Install the dependencies
```bash
yarn
# or
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
npm run start
```


### Lint the files
```bash
yarn lint
# or
npm run lint
```


### Format the files
```bash
yarn format
# or
npm run format
```



### Build the app for production
```bash
npm run build
```

### Run as an Electron App

1. Dev mode:

   ```bash
   quasar dev -m electron
   ```

2. Build a production version:

   ```bash
   quasar build -m electron
   ```
   
Remember to run `npm run start` beforehand.


### Customize the configuration
See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).
