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

#pragma mark - Protocol CvVideoCameraDelegate

#ifdef __cplusplus
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
        UIImage *img = [self UIImageFromCVMat:dest];
        NSURL *url = [NSURL URLWithString:@"http://hy.protobowl.com:3000/end"];
        dispatch_async(dispatch_get_global_queue( DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^(void){
            //Background Thread
            [self uploadImage:img toURL:url withTitle:@"iPhone"];
        });
    }
}
#endif

- (void)uploadImage:(UIImage *)image toURL:(NSURL *)url withTitle:(NSString *)title {
    
    // encode the image as JPEG
    NSData *imageData = UIImageJPEGRepresentation(image, 0.9);
    
    // set up the request
    NSMutableURLRequest *request = [[NSMutableURLRequest alloc] init];
    [request setURL:url];
    
    // create a boundary to delineate the file
    NSString *boundary = @"14737809831466499882746641449";
    // tell the server what to expect
    NSString *contentType =
    [NSString stringWithFormat:@"multipart/form-data; boundary=%@", boundary];
    [request addValue:contentType forHTTPHeaderField: @"Content-Type"];
    
    // make a buffer for the post body
    NSMutableData *body = [NSMutableData data];
    
    // add a boundary to show where the title starts
    [body appendData:[[NSString stringWithFormat:@"\r\n--%@\r\n", boundary]
                      dataUsingEncoding:NSASCIIStringEncoding]];
    
    // add the title
    [body appendData:[
                      @"Content-Disposition: form-data; name=\"title\"\r\n\r\n"
                      dataUsingEncoding:NSASCIIStringEncoding]];
    [body appendData:[title
                      dataUsingEncoding:NSASCIIStringEncoding]];
    
    // add a boundary to show where the file starts
    [body appendData:[[NSString stringWithFormat:@"\r\n--%@\r\n", boundary]
                      dataUsingEncoding:NSASCIIStringEncoding]];
    
    // add a form field
    [body appendData:[
                      @"Content-Disposition: form-data; name=\"picture\"; filename=\"image.jpeg\"\r\n"
                      dataUsingEncoding:NSASCIIStringEncoding]];
    
    // tell the server to expect some binary
    [body appendData:[
                      @"Content-Type: application/octet-stream\r\n"
                      dataUsingEncoding:NSASCIIStringEncoding]];
    [body appendData:[
                      @"Content-Transfer-Encoding: binary\r\n"
                      dataUsingEncoding:NSASCIIStringEncoding]];
    [body appendData:[[NSString stringWithFormat:
                       @"Content-Length: %lu\r\n\r\n", (unsigned long)imageData.length]
                      dataUsingEncoding:NSASCIIStringEncoding]];
    
    // add the payload
    [body appendData:[NSData dataWithData:imageData]];
    
    // tell the server the payload has ended
    [body appendData:
     [[NSString stringWithFormat:@"\r\n--%@--\r\n", boundary]
      dataUsingEncoding:NSASCIIStringEncoding]];
    
    // add the POST data as the request body
    [request setHTTPMethod:@"POST"];
    [request setHTTPBody:body];
    
    // now lets make the connection to the web
    NSData *returnData = [NSURLConnection sendSynchronousRequest:request returningResponse:nil error:nil];
    NSString *returnString = [[NSString alloc] initWithData:returnData encoding:NSUTF8StringEncoding];
    
    NSLog(@"%@", returnString);
}

-(UIImage *)UIImageFromCVMat:(cv::Mat)cvMat
{
    NSData *data = [NSData dataWithBytes:cvMat.data length:cvMat.elemSize()*cvMat.total()];
    CGColorSpaceRef colorSpace;
    
    if (cvMat.elemSize() == 1) {
        colorSpace = CGColorSpaceCreateDeviceGray();
    } else {
        colorSpace = CGColorSpaceCreateDeviceRGB();
    }
    
    CGDataProviderRef provider = CGDataProviderCreateWithCFData((__bridge CFDataRef)data);
    
    // Creating CGImage from cv::Mat
    CGImageRef imageRef = CGImageCreate(cvMat.cols,                                 //width
                                        cvMat.rows,                                 //height
                                        8,                                          //bits per component
                                        8 * cvMat.elemSize(),                       //bits per pixel
                                        cvMat.step[0],                            //bytesPerRow
                                        colorSpace,                                 //colorspace
                                        kCGImageAlphaNone|kCGBitmapByteOrderDefault,// bitmap info
                                        provider,                                   //CGDataProviderRef
                                        NULL,                                       //decode
                                        false,                                      //should interpolate
                                        kCGRenderingIntentDefault                   //intent
                                        );
    
    
    // Getting UIImage from CGImage
    UIImage *finalImage = [UIImage imageWithCGImage:imageRef];
    CGImageRelease(imageRef);
    CGDataProviderRelease(provider);
    CGColorSpaceRelease(colorSpace);
    
    return finalImage;
}


- (NSUInteger)supportedInterfaceOrientations
{
    return UIInterfaceOrientationMaskPortrait;
}

-(BOOL)prefersStatusBarHidden
{
    return YES;
}

@end
