//
//  ViewController.m
//  HyperInk
//
//  Created by Anish Athalye on 7/18/14.
//  Copyright (c) 2014 Anish Athalye. All rights reserved.
//

#import "ViewController.h"

#import "SRWebSocket.h"

#ifdef __cplusplus
#import <opencv2/imgproc/imgproc.hpp>
#import <opencv2/highgui/highgui.hpp>
#import "Vision.hh"
#endif

using namespace cv;

@interface ViewController () <SRWebSocketDelegate>

@property IBOutlet UIImageView *imageView;
@property CvVideoCamera *videoCamera;
@property SRWebSocket *webSocket;

@end

@implementation ViewController

- (void)viewDidLoad
{
    [super viewDidLoad];
    
    NSString *imageName = [[NSBundle mainBundle] pathForResource:@"hyperinksplash" ofType:@"png"];
    UIImage *img = [UIImage imageWithContentsOfFile:imageName];
    [self.imageView setImage:img];
    
    self.imageView.userInteractionEnabled = YES;
    UITapGestureRecognizer *recognizer = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(handleTap:)];
    [self.imageView addGestureRecognizer:recognizer];
    
    [self initCamera];
    [self initSocket];
}

- (void)initSocket
{
    NSURL *url = [NSURL URLWithString:@"ws://hy.protobowl.com:9000"];
    self.webSocket = [[SRWebSocket alloc] initWithURL:url];
    // self.webSocket.delegate = self;
    [self.webSocket open];
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
        NSArray *devices = [AVCaptureDevice devices];
        NSError *error;
        for (AVCaptureDevice *device in devices) {
            if ([device position] == AVCaptureDevicePositionBack) {
                [device lockForConfiguration:&error];
                if ([device isFocusModeSupported:AVCaptureFocusModeAutoFocus]) {
                    device.focusMode = AVCaptureFocusModeAutoFocus;
                }
                [device unlockForConfiguration];
            }
        }
    }
}

- (void)processImage:(Mat&)image;
{
    static Mat dest;
    static double lastCalled = 0;
    double now = [[NSDate date] timeIntervalSince1970];
    double delta = now - lastCalled;
    NSLog(@"FPS: %lf", 1 / delta);
    lastCalled = now;
    bool success = Vision::processImage(image, dest);
    if (success) {
        [self uploadImage:dest];
    }
}

- (void)uploadImage:(Mat&)image {
    vector<uchar> buf;
    cv::imencode(".jpg", image, buf);
    NSData *imageData = [NSData dataWithBytes:&buf.front() length:buf.size()];
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        [self.webSocket send:imageData];
    });
}

- (NSUInteger)supportedInterfaceOrientations
{
    return UIInterfaceOrientationMaskPortrait;
}

- (void)webSocket:(SRWebSocket *)webSocket didReceiveMessage:(id)message
{
    
}

- (void)webSocketDidOpen:(SRWebSocket *)webSocket
{
    NSLog(@"Socket opened");
}

- (void)webSocket:(SRWebSocket *)webSocket didFailWithError:(NSError *)error
{
    NSLog(@"Socket failed, reopening...");
    [self initSocket];
}

- (void)webSocket:(SRWebSocket *)webSocket didCloseWithCode:(NSInteger)code reason:(NSString *)reason wasClean:(BOOL)wasClean
{
    NSLog(@"Socket closed, reopening...");
    [self initSocket];
}

-(BOOL)prefersStatusBarHidden
{
    return YES;
}

@end
