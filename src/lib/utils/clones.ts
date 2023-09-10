export function cloneImageData(originalImageData: ImageData): ImageData {
    const newImageData = new ImageData(
        new Uint8ClampedArray(originalImageData.data),
        originalImageData.width,
        originalImageData.height
    );

    return newImageData;
}