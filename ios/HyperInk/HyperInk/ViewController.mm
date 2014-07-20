//
//  ViewController.m
//  HyperInk
//
//  Created by Anish Athalye on 7/18/14.
//  Copyright (c) 2014 Anish Athalye. All rights reserved.
//

#import "ViewController.h"

#ifdef __cplusplus
#import <opencv2/imgproc/imgproc.hpp>
#import "Vision.hh"
#endif

using namespace cv;

@interface ViewController ()

@property IBOutlet UIImageView *imageView;
@property CvVideoCamera *videoCamera;

@end

@implementation ViewController

- (void)viewDidLoad
{
    [super viewDidLoad];
    
    self.imageView.userInteractionEnabled = YES;
    UITapGestureRecognizer *recognizer = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(handleTap:)];
    [self.imageView addGestureRecognizer:recognizer];
    
    [self initCamera];
}

- (void)initCamera
{
    self.videoCamera = [[CvVideoCamera alloc] initWithParentView:self.imageView];
    self.videoCamera.delegate = self;
    self.videoCamera.defaultAVCaptureDevicePosition = AVCaptureDevicePositionBack;
    self.videoCamera.defaultAVCaptureSessionPreset = AVCaptureSessionPreset1280x720;
    self.videoCamera.defaultAVCaptureVideoOrientation = AVCaptureVideoOrientationLandscapeLeft; // home button on left
    self.videoCamera.defaultFPS = 30;
    self.videoCamera.grayscaleMode = NO;
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)handleTap:(UITapGestureRecognizer *)sender
{
    if (sender.state == UIGestureRecognizerStateEnded)
    {
        NSLog(@"Starting video camera");
        [self.videoCamera start];
    }
}

#pragma mark - Protocol CvVideoCameraDelegate

#ifdef __cplusplus
- (void)processImage:(Mat&)image;
{
    static Mat dest;
    bool success = Vision::processImage(image, dest);
}
#endif


- (NSUInteger)supportedInterfaceOrientations
{
    return UIInterfaceOrientationMaskPortrait;
}

-(BOOL)prefersStatusBarHidden
{
    return YES;
}

@end
