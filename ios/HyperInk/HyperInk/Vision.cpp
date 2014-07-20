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
#include <algorithm>
#include <utility>

namespace Vision
{
    
    using namespace std;
    using namespace cv;

#define CANNY_THRESH (100)
#define POLY_APPROX_MULT (0.01)
#define BILATERAL_DIAM (5)
#define BILATERAL_SIGMACOLOR (50)
#define BILATERAL_SIGMASPACE (50)
#define POLY_SIZE_LOW (0.1)
#define POLY_SIZE_HIGH (0.95)
#define ASPECT_RATIO (8.5 / 11.0)
#define TARGET_WIDTH (1000)
#define DIST_REQUIREMENT (200.0)
#define MATCH_REQUIREMENT 10

    static Scalar color_red = Scalar(0, 0, 255, 255);
    static Scalar color_blue = Scalar(255, 0, 0, 255);
    static Scalar color_green = Scalar(0, 255, 0, 255);

    std::vector<Point> findRect(cv::Mat &image, cv::Mat &dest);
    
    void drawRect(cv::Mat &image, std::vector<Point> rect);
    
    bool isSameRect(const std::vector<Point> &rect);
    
    bool isRightRect(const cv::Mat &image, const std::vector<Point> &rect, double area);
    
    void transform(const cv::Mat &image, const std::vector<Point> &rect, cv::Mat &out);
    
    vector<Point2f> sortRect(const std::vector<Point> &rect);
    
    double sumSquareDistances(const vector<Point2f> &first, const vector<Point2f> &second);
    
    bool processImage(cv::Mat &image, cv::Mat &transImage)
    {
        static Mat dest(image.rows, image.cols, CV_8UC1);
        vector<Point> rect = findRect(image, dest);
        if (!rect.empty()) {
            transform(dest, rect, transImage);
            // cvtColor(transImage, transImage, CV_BGR2RGB);
            drawRect(image, rect);
            return true;
        }
        return false;
    }
    
    void drawRect(cv::Mat &image, std::vector<Point> rect)
    {
        if (!rect.empty()) {
            vector<vector<Point>> tmp(1, rect);
            drawContours(image, tmp, 0, color_red, 3, 8);
            for (int j = 0; j < rect.size(); j++) {
                circle(image, rect[j], 10, color_green, CV_FILLED);
            }
        }
    }
    
    std::vector<Point> findRect(cv::Mat &image, cv::Mat &dest)
    {
        // image dimensions must never change between calls
        // because of statically allocated data structures
        // static Mat dest(image.rows, image.cols, CV_8UC1);
        static Mat grey(image.rows, image.cols, CV_8UC1);
        cvtColor(image, grey, CV_BGR2GRAY);
        bilateralFilter(grey, dest, BILATERAL_DIAM, BILATERAL_SIGMACOLOR, BILATERAL_SIGMASPACE);
        
        static Mat canny_output;
        Canny(dest, canny_output, CANNY_THRESH, CANNY_THRESH * 2);
        
        vector<vector<Point>> contours;
        findContours(canny_output, contours, CV_RETR_LIST, CV_CHAIN_APPROX_SIMPLE);
        
        static Mat hull;
        vector<Point> rect;
        for (const auto &contour : contours) {
            convexHull(contour, hull);
            vector<Point> poly;
            double len = arcLength(hull, true);
            approxPolyDP(hull, poly, len * POLY_APPROX_MULT, true);
            if (poly.size() == 4 && isContourConvex(poly)) {
                double area = contourArea(poly);
                if (isRightRect(image, poly, area)) {
                    if (rect.size() == 0 || len > arcLength(rect, true)) {
                        rect = poly;
                    }
                }
            }
        }
        if (!rect.empty()) {
            bool same = isSameRect(rect);
            if (!same) {
                rect.clear();
                cout << "Discarded bad rect" << endl;
            }
        }

        return rect;
    }
    
    double sumSquareDistances(const vector<Point2f> &first, const vector<Point2f> &second)
    {
        double sum = 0;
        for (int i = 0; i < first.size() && i < second.size(); i++) {
            double dx = first[i].x - second[i].x;
            double dy = first[i].y - second[i].y;
            sum += dx * dx + dy * dy;
        }
        return sum;
    }
    
    bool isSameRect(const std::vector<Point> &rect)
    {
        static vector<Point2f> old;
        static int matches = 0;
        
        vector<Point2f> sorted = sortRect(rect);
        if (!old.empty()) {
            double dist = sumSquareDistances(old, sorted);
            cout << "dist = " << dist << endl;
            if (dist < DIST_REQUIREMENT) {
                old = sorted;
                matches++;
            } else {
                old = sorted;
                matches = 0;
            }
        }
        old = sorted;
        
        return (matches > MATCH_REQUIREMENT);
    }

    bool isRightRect(const cv::Mat &image, const std::vector<Point> &rect, double area)
    {
        const double image_size = image.rows * image.cols;
        return POLY_SIZE_LOW * image_size <= area && area <= image_size * POLY_SIZE_HIGH;
    }
    
    using pii = pair<int, int>;
    
    bool byX(pii a, pii b)
    {
        return a.first < b.first;
    }
    
    bool byY(pii a, pii b)
    {
        return a.second < b.second;
    }
    
    vector<Point2f> sortRect(const std::vector<Point> &rect)
    {
        assert(rect.size() == 4);
        vector<pii> points;
        for (const auto &point : rect) {
            points.push_back(make_pair(point.x, point.y));
        }
        
        sort(points.begin(), points.end(), byX);
        sort(points.begin(), points.begin() + 2, byY);
        sort(points.begin() + 2, points.end(), byY);
        
        // points is now in order:
        // topLeft, bottomLeft, topRight, bottomRight
        
        vector<Point2f> from;
        for (const auto &point : points) {
            from.emplace_back(point.first, point.second);
        }
        
        return from;

    }

    void transform(const cv::Mat &image, const std::vector<Point> &rect, cv::Mat &out)
    {
        vector<Point2f> from = sortRect(rect);

        int width = TARGET_WIDTH;
        int height = width * ASPECT_RATIO;
        
        vector<Point2f> to;
        to.emplace_back(0, 0);
        to.emplace_back(0, height);
        to.emplace_back(width, 0);
        to.emplace_back(width, height);

        Mat transMatrix = getPerspectiveTransform(from, to);

        warpPerspective(image, out, transMatrix, Size(width, height));
    }
    
}