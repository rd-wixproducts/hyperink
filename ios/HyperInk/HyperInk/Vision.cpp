//
//  Vision.cpp
//  HyperInk
//
//  Created by Anish Athalye on 7/19/14.
//  Copyright (c) 2014 Anish Athalye. All rights reserved.
//

#include "Vision.hh"

#include <opencv2/imgproc/imgproc.hpp>

#include <vector>

namespace Vision
{

using namespace std;
using namespace cv;
    
#define CANNY_THRESH (100)
#define POLY_APPROX_MULT (0.025)
#define BILATERAL_DIAM (5)
#define BILATERAL_SIGMACOLOR (50)
#define BILATERAL_SIGMASPACE (50)

static Scalar color_red = Scalar(0, 0, 255, 255);
static Scalar color_blue = Scalar(255, 0, 0, 255);
static Scalar color_green = Scalar(0, 255, 0, 255);

void processImage(cv::Mat& image)
{
    // image dimensions must never change between calls
    // because of statically allocated data structures
    static Mat dest(image.rows, image.cols, CV_8UC1);
    static Mat grey(image.rows, image.cols, CV_8UC1);
    cvtColor(image, grey, CV_BGR2GRAY);
    bilateralFilter(grey, dest, BILATERAL_DIAM, BILATERAL_SIGMACOLOR, BILATERAL_SIGMASPACE);

    static Mat canny_output;
    Canny(dest, canny_output, CANNY_THRESH, CANNY_THRESH * 2);

    vector<vector<Point>> contours;
    findContours(canny_output, contours, CV_RETR_LIST, CV_CHAIN_APPROX_SIMPLE);
    
    // Draw contours
    static Mat hull;
    vector<Point> rect;
    for (const auto &contour : contours) {
        // vector<Point> hull;
        convexHull(contour, hull);
        vector<Point> poly;
        double len = arcLength(hull, true);
        approxPolyDP(hull, poly, len * POLY_APPROX_MULT, true);
        if (poly.size() >= 4 && isContourConvex(poly)) {
            // double area = contourArea(poly);
            // filter based on area?
            if (rect.size() == 0 || len > arcLength(rect, true)) {
                rect = poly;
            }
        }
    }
    
    if (!rect.empty()) {
        vector<vector<Point>> tmp(1, rect);
        drawContours(image, tmp, 0, color_blue, 3, 8);
        for (int j = 0; j < rect.size(); j++) {
            circle(image, rect[j], 10, color_green, CV_FILLED);
        }
    }
}

}