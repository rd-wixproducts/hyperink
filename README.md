hyperink
========

We make collaboration easier by allowing people to share their drawings in real
time with the authentic look and feel of using a ink pen on real paper. We
employ powerful parallelized image processing algorithms in OpenCV to analyze
live video of someone writing on a piece of paper captured by an iOS
application. Using Canny edge detection and polygonal approximation of closed
contours, we identify/track the portion of view that is occupied by the piece
of paper. This image segment is then corrected using an inverse perspective
transform. After all of this analysis, we push the extracted frames to a Node
back-end for display in a web application powered by Angular. The resulting
data is filtered using a stroke width transform to determine which parts of the
image are drawn and which parts are occluding objects/hands. We also employ
Firebase for storing and real-time updating of shared data such as document
annotations.

Here's a [demo video][demo]. There's no audio, but you can figure out what's
going on.

Here are a couple pictures of our iOS app in its early stages, automatically
identifying a piece of paper and drawing a box around it and adding green dots
to indicate the corners, all done in real-time:

![iphone][iphone]

And this is Anish pointing the phone at a piece of paper on the ground:

![anish][anish]

---

Also, please take a look at our Medium post about our experience building this
project at the Greylock Hackfest! The link is posted below:

https://medium.com/@nikhilbuduma/greylock-hackfest-medium-e9b6cc2e82a4

---

Web stuff belongs in `web/`.

iOS stuff belongs in `ios/`.

HASHTAG YOLO

WOW SUCH PROJECT

VERY HACK

[iphone]: photos/IMG_2736.PNG
[anish]: photos/IMG_2738.JPG
[demo]: https://www.youtube.com/watch?v=Q5a451II2R4
