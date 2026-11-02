#import <Foundation/Foundation.h>
#import <AppKit/AppKit.h>
#import <PDFKit/PDFKit.h>
int main(int argc,char *argv[]){@autoreleasepool{PDFDocument *d=[[PDFDocument alloc]initWithURL:[NSURL fileURLWithPath:@(argv[1])]];NSImage *im=[[d pageAtIndex:9]thumbnailOfSize:NSMakeSize(1000,1414) forBox:kPDFDisplayBoxMediaBox];NSBitmapImageRep *rep=[[NSBitmapImageRep alloc]initWithData:im.TIFFRepresentation];[[rep representationUsingType:NSBitmapImageFileTypePNG properties:@{}]writeToFile:@"docs/pump-page-10.png" atomically:YES];}return 0;}
