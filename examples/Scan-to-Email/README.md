# Scan-to-Email

This is a web scanning app based on Dynamic Web TWAIN which has the ability to send scanned documents with emails. If the file is too large, it is uploaded to Dropbox.

## How to run the project

1. Install requirements:

```
pip install -r requirements.txt 
```

2. Create a file named `account` and enter your email account info like this:

```
xx@dynamsoft.com
xxxxxx
smtp.office365.com
```

3. In order to use Dropbox, create an app and generate your access token here: <https://www.dropbox.com/developers/apps/> and then set the token in the `dropbox_helper.py`.

4. Run the app:

```
flask run
```

You also need to apply for a product key to use Dynamic Web TWAIN. You can get a trial license here: <https://www.dynamsoft.com/customer/license/trialLicense/?product=dwt>.


