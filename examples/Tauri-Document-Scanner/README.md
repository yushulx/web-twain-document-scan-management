# Tauri-Document-Scanner

A document scanning desktop app with Tauri using React + Ant Design. It uses [Dynamic Web TWAIN](https://www.dynamsoft.com/web-twain/overview/) to provide the ability to interact with document scanners.


## How to Run

1. Install modules

   ```
   npm install
   ```

2. Copy the resources of Dynamic Web TWAIN to the `public` folder and the installers of Dynamsoft Service to the `resources` folder.

   ```
   npm run copy:resources
   ```
   
   Make sure that you've installed `npx`.

3. Run the app in dev mode:

   ```
   npm run tauri dev
   ```

4. Build the installer:

   ```
   npm run tauri build
   ```

## Trial License

You can [apply for a trial license](https://www.dynamsoft.com/customer/license/trialLicense/?product=dwt) for Dynamic Web TWAIN and add a license props to the `DocumentViewer` component to use it.


