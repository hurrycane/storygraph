import abc
import json
from watson_developer_cloud import SpeechToTextV1

class StoryToText():
    __metaclass__ = abc.ABCMeta

    @abc.abstractmethod
    def recognize(self, audio_file_content):
        """
        Return the text that was inferred from the audio file
        """
        return

class WatsonStoryToText(StoryToText):
    """
    Watson Speech2Text
    """
    def __init__(self, username, password):
        self.speech_to_text = SpeechToTextV1(
            username=username,
            password=password,
            x_watson_learning_opt_out=False
        )

    def recognize(self, audio_file_path):
        with open(audio_file_path, 'rb') as audio_file:
            return self.speech_to_text.recognize(audio_file,
                continuous=True, content_type='audio/wav')
