from googleapiclient import discovery
import httplib2
from oauth2client.client import GoogleCredentials

SCOPED_PATH = ['https://www.googleapis.com/auth/cloud-platform']

class CloudNativeLanguageConnector(object):

    def __init__(self):
        self.credentials = GoogleCredentials.get_application_default()
        self.scoped_credentials = self.credentials.create_scoped(SCOPED_PATH)

    def analize(self, text):
        http = httplib2.Http()
        self.scoped_credentials.authorize(http)
        service = discovery.build('language', 'v1beta1', http=http)

        body = {
            'document': {
                'type': 'PLAIN_TEXT',
                'content': text,
            },
            'features': {
                'extract_syntax': True,
            },
            'encodingType': 'UTF16',
        }
        request = service.documents().annotateText(body=body)
        return request.execute()
