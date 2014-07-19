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

void processImage(cv::Mat& image)
{
    static Mat dest(image.rows, image.cols, CV_8UC1); // image dimensions must never change
    static Mat grey(image.rows, image.cols, CV_8UC1);
    cvtColor(image, grey, CV_BGR2GRAY);
    bilateralFilter(grey, dest, BILATERAL_DIAM, BILATERAL_SIGMACOLOR, BILATERAL_SIGMASPACE);

    static Mat canny_output;
    vector<vector<Point>> contours;
    vector<Vec4i> hierarchy;
    Canny(dest, canny_output, CANNY_THRESH, CANNY_THRESH * 2);
    findContours(canny_output, contours, hierarchy, CV_RETR_LIST, CV_CHAIN_APPROX_SIMPLE);
    
    // Draw contours
    for (int i = 0; i < contours.size(); i++) {
        static Scalar color_red = Scalar(0, 0, 255, 255);
        static Scalar color_blue = Scalar(255, 0, 0, 255);
        static Scalar color_green = Scalar(0, 255, 0, 255);

        vector<Point> contour = contours[i];
        vector<Point> hull;
        convexHull(contour, hull);
        vector<Point> poly;
        double len = arcLength(hull, true);
        approxPolyDP(hull, poly, len * POLY_APPROX_MULT, true);
        double area = contourArea(poly);
        vector<vector<Point>> tmp;
        tmp.push_back(poly);
        // drawContours(image, contours, i, color_red, CV_FILLED, 8);
        drawContours(image, tmp, 0, color_blue, 3, 8);
        if (poly.size() >= 4) {
            if (isContourConvex(poly)) {
                for (int j = 0; j < poly.size(); j++) {
                    circle(image, poly[j], 10, color_green, CV_FILLED);
                }
            }
        }
        
        
        // drawContours(image, contours, i, color, 10, 8, hierarchy, 0, Point());
    }
}

}