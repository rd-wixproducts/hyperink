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

---

Web stuff belongs in `web/`.

iOS stuff belongs in `ios/`.

HASHTAG YOLO

WOW SUCH PROJECT

VERY HACK
