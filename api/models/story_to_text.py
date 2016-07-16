import abc

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
        print audio_file_path
        with open(join(dirname(__file__), audio_file_path), 'rb') as audio_file:
            return json.dumps(speech_to_text.recognize(
                audio_file,
                content_type='audio/wav'), indent=2))
