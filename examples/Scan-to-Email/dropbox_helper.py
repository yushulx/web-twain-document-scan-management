import datetime
import dropbox
from dropbox.files import WriteMode
from dropbox.exceptions import ApiError, AuthError


class dropbox_helper:

    def __init__(self):
        #Create an app and generate your access token here: https://www.dropbox.com/developers/apps/
        self.dbx = dropbox.Dropbox("<access_token>")

    def upload(self,filebytes,filepath):
        try:
            self.dbx.files_upload(filebytes, filepath, mode=WriteMode('overwrite'))
            return True
        except ApiError as err:
            return False
            
    def create_sharing_link(self,filepath):
        try:
            #expires = datetime.datetime.now() + datetime.timedelta(days=30)
            #settings = dropbox.sharing.SharedLinkSettings(require_password=True,link_password="123456",expires=expires)
            #shared_link_metadata = dbx.sharing_create_shared_link_with_settings(filepath, settings=desired_shared_link_settings)
            shared_link_metadata = self.dbx.sharing_create_shared_link(filepath)
            return shared_link_metadata.url
        except ApiError as err:
            return None
        

if __name__ == '__main__':
    helper=dropbox_helper()
    if helper.upload(open('email_utils.py', 'rb').read(),'/email_utils.py'):
        print(helper.create_sharing_link('/email_utils.py'))
        
        
        