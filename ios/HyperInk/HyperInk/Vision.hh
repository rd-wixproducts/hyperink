//
//  Vision.h
//  HyperInk
//
//  Created by Anish Athalye on 7/19/14.
//  Copyright (c) 2014 Anish Athalye. All rights reserved.
//

#ifndef __HyperInk__Vision__
#define __HyperInk__Vision__

#include <iostream>
#include <opencv2/core/core.hpp>

namespace Vision
{
    
    bool processImage(cv::Mat &image, cv::Mat &transImage);
    
}

#endif /* defined(__HyperInk__Vision__) */
