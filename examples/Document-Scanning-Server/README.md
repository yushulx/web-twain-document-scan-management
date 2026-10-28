# Document-Scanning-Server

A Python Flask Document Scanning Server using Dynamic Web TWAIN in Headless Chrome


Usage:

1. [Download](https://www.dynamsoft.com/web-twain/downloads) and install Dynamic Web TWAIN.
2. Copy the `Resources` folder of Dynamic Web TWAIN into `static`.
3. Edit `Resources/dynamsoft.webtwain.config` to configure your own license and disable `AutoLoad` since we will do this manually. You can apply for a trial license [here](https://www.dynamsoft.com/customer/license/trialLicense/?product=dwt).

   ```diff
   + Dynamsoft.DWT.AutoLoad = false;
   - Dynamsoft.DWT.AutoLoad = true;
   Dynamsoft.DWT.ProductKey = 'LICENSE-KEY';
   ```

4. `pip install selenium flask`
5. `python server.py`

Now, you can visit <http://127.0.0.1:5000/index.html> to have a try.

