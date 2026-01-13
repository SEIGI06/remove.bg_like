import { getModel } from './ai-model';
import { RawImage } from '@xenova/transformers';
import { Jimp } from 'jimp';
import { PNG } from 'pngjs';

/**
 * Process the image to remove the background.
 * @param imageBuffer - The input image buffer.
 * @returns - The processed image buffer (PNG).
 */
export async function removeBackground(imageBuffer: Buffer): Promise<Buffer> {
    const { model, processor } = await getModel();

    console.log('Start processing...');
    console.time('Jimp Load');
    // 1. Decode image using Jimp (Pure JS, safer than Sharp for this env)
    const jimpImage = await Jimp.read(imageBuffer);
    console.timeEnd('Jimp Load');

    const width = jimpImage.bitmap.width;
    const height = jimpImage.bitmap.height;

    console.log(`Processing image size: ${width}x${height}`);
    const { data: requestData } = jimpImage.bitmap;
    
    // Jimp stores data as RGBA flat buffer, which is what RawImage expects.
    const image = new RawImage(requestData, width, height, 4);

    // 2. Pre-process
    const { pixel_values } = await processor(image);

    // 3. Run Inference
    const { output } = await model({ input: pixel_values });

    // 4. Post-process (Get the mask)
    const mask = await RawImage.fromTensor(output[0].mul(255).to('uint8')).resize(width, height);

    const maskData = mask.data; // Uint8Array
    
    // 5. Final Application: Deep Copy with Mask
    // The split-screen test proved that our mask data (maskVal) is correct.
    // We now apply this mask to the Alpha channel.
    const outputBuffer = Buffer.alloc(width * height * 4);
    const sourceData = jimpImage.bitmap.data;

    for (let i = 0; i < width * height; i++) {
        const idx = i * 4;     // RGBA index
        const maskVal = maskData[i]; // Grayscale mask value (0=Background, 255=Foreground)
        
        // Copy RGB from source
        outputBuffer[idx] = sourceData[idx];     // R
        outputBuffer[idx + 1] = sourceData[idx + 1]; // G
        outputBuffer[idx + 2] = sourceData[idx + 2]; // B
        
        // Apply Mask to Alpha
        // If mask is dark (background), make it transparent.
        if (maskVal < 128) { // Threshold
            outputBuffer[idx + 3] = 0; // Transparent
        } else {
            outputBuffer[idx + 3] = 255; // Opaque
        }
    }

    // 6. Return Buffer
    console.log('Generating final output buffer...');
    
    const png = new PNG({
        width: width,
        height: height,
        inputColorType: 6, // RGBA
        inputHasAlpha: true
    });
    
    png.data = outputBuffer;
    
    const resultBuffer = PNG.sync.write(png);

    return resultBuffer;
}
