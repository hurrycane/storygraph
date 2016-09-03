# Story Graph

StoryGraph is a speech to image application. It's main use case is for bed time
story telling: imagine telling a story to someone and having an app render
a number of images for each phrase you speak.

## Technical details

We use Watson Speech API for speech to text transformation. After that
we feed each phrase into Google's *Syntax Net* to adnotate it with POS. Then we
apply a model to summarize the phrase to a number of search terms that we
use to search images using bing image search.

## Team Members

* [Daniel Galvez](https://github.com/galv)
* [Paul Mou](https://github.com/moomou)
* [Aysar Khalid](https://github.com/aysark)
* [Shiraz Chokshi](https://github.com/ShirazC)
* [Bogdan Gaza](https://github.com/hurrycane)
