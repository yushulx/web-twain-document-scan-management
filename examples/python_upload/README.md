# Online Document Scanning with Django and Dynamic Web TWAIN

This sample demonstrates how to use [Dynamic Web TWAIN](https://www.dynamsoft.com/web-twain/overview/) and [Django](https://www.djangoproject.com/) to create a straightforward online document scanning application in just a few lines of code.

## Prerequisites

- [Python](https://www.python.org/downloads/) 
- Django 
    
    ```bash
    python -m pip install Django
    python -m django --version
    ```
- [Dynamic Web TWAIN Trial License](https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform)

## How to Run This Sample
1. Configure the static files in `djangodwt/settings.py`:

    ```python
    STATIC_URL = '/static/'

    STATICFILES_DIRS = [
        os.path.join(BASE_DIR, "../../sdk")
    ]
    ```

2. Insert the license key in `index.html`:
    
    ```js
    Dynamsoft.DWT.ProductKey = 'LICENSE-KEY';
    ```

3. Execute the following commands to run the project:

    ```bash
    python manage.py makemigrations
    python manage.py migrate --run-syncdb
    python manage.py runserver
    ``` 
    
4. Open a web browser and navigate to `http://127.0.0.1:8000`.

    ![Web document scan by Python Django](https://www.dynamsoft.com/codepool/img/2020/09/django-scan-upload-document.jpg)

## Blog 
[Online Document Scanning Using Python Django and Dynamic Web TWAIN](https://www.dynamsoft.com/codepool/online-document-scanning-django-webtwain.html)





