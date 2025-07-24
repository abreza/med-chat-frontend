/* eslint-disable @typescript-eslint/no-explicit-any */
import * as nifti from "nifti-reader-js";

export interface NiftiData {
  header: any;
  image: ArrayBuffer;
  typedData: any;
  dims: number[];
  pixdims: number[];
}

export class NiftiLoader {
  static async loadNiftiFile(url: string): Promise<NiftiData> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch NIfTI file: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();

      const isGzipped = nifti.isCompressed(arrayBuffer);

      let data: ArrayBuffer;
      if (isGzipped) {
        data = nifti.decompress(arrayBuffer) as ArrayBuffer;
      } else {
        data = arrayBuffer;
      }

      if (!nifti.isNIFTI(data)) {
        throw new Error("File is not a valid NIfTI file");
      }

      const header = nifti.readHeader(data);
      const image = nifti.readImage(header, data);

      let typedData;
      switch (header.datatypeCode) {
        case nifti.NIFTI1.TYPE_UINT8:
          typedData = new Uint8Array(image);
          break;
        case nifti.NIFTI1.TYPE_INT16:
          typedData = new Int16Array(image);
          break;
        case nifti.NIFTI1.TYPE_INT32:
          typedData = new Int32Array(image);
          break;
        case nifti.NIFTI1.TYPE_FLOAT32:
          typedData = new Float32Array(image);
          break;
        case nifti.NIFTI1.TYPE_FLOAT64:
          typedData = new Float64Array(image);
          break;
        default:
          typedData = new Float32Array(image);
      }

      return {
        header,
        image,
        typedData,
        dims: header.dims.slice(1, 4),
        pixdims: header.pixDims.slice(1, 4),
      };
    } catch (error) {
      console.error("Error loading NIfTI file:", error);
      throw error;
    }
  }

  static getSliceData(
    niftiData: NiftiData,
    sliceIndex: number,
    orientation: "axial" | "sagittal" | "coronal" = "axial"
  ): Float32Array {
    const { typedData, dims } = niftiData;
    const [width, height, depth] = dims;

    let maxSlice: number;
    switch (orientation) {
      case "axial":
        maxSlice = depth;
        break;
      case "sagittal":
        maxSlice = width;
        break;
      case "coronal":
        maxSlice = height;
        break;
      default:
        maxSlice = depth;
    }

    if (sliceIndex < 0 || sliceIndex >= maxSlice) {
      throw new Error(
        `Slice index ${sliceIndex} out of bounds for ${orientation} orientation (max: ${
          maxSlice - 1
        })`
      );
    }

    let sliceSize: number;
    let sliceData: Float32Array;

    switch (orientation) {
      case "axial":
        sliceSize = width * height;
        sliceData = new Float32Array(sliceSize);
        const startIndex = sliceIndex * sliceSize;
        for (let i = 0; i < sliceSize; i++) {
          sliceData[i] = typedData[startIndex + i];
        }
        break;

      case "sagittal":
        sliceSize = height * depth;
        sliceData = new Float32Array(sliceSize);
        for (let z = 0; z < depth; z++) {
          for (let y = 0; y < height; y++) {
            const index3d = sliceIndex + y * width + z * width * height;
            const index2d = y + z * height;
            sliceData[index2d] = typedData[index3d];
          }
        }
        break;

      case "coronal":
        sliceSize = width * depth;
        sliceData = new Float32Array(sliceSize);
        for (let z = 0; z < depth; z++) {
          for (let x = 0; x < width; x++) {
            const index3d = x + sliceIndex * width + z * width * height;
            const index2d = x + z * width;
            sliceData[index2d] = typedData[index3d];
          }
        }
        break;

      default:
        throw new Error("Invalid orientation");
    }

    return sliceData;
  }

  static normalizeIntensity(data: Float32Array): Uint8ClampedArray {
    if (data.length === 0) {
      return new Uint8ClampedArray(0);
    }

    let min = data[0];
    let max = data[0];

    for (let i = 1; i < data.length; i++) {
      const value = data[i];
      if (value < min) min = value;
      if (value > max) max = value;
    }

    const range = max - min;
    const normalized = new Uint8ClampedArray(data.length);

    if (range > 0) {
      for (let i = 0; i < data.length; i++) {
        normalized[i] = Math.round(((data[i] - min) / range) * 255);
      }
    } else {
      normalized.fill(128);
    }

    return normalized;
  }

  static getIntensityStats(data: Float32Array): {
    min: number;
    max: number;
    mean: number;
    std: number;
  } {
    if (data.length === 0) {
      return { min: 0, max: 0, mean: 0, std: 0 };
    }

    let min = data[0];
    let max = data[0];
    let sum = 0;

    for (let i = 0; i < data.length; i++) {
      const value = data[i];
      if (value < min) min = value;
      if (value > max) max = value;
      sum += value;
    }

    const mean = sum / data.length;

    let sumSquaredDiff = 0;
    for (let i = 0; i < data.length; i++) {
      const diff = data[i] - mean;
      sumSquaredDiff += diff * diff;
    }

    const std = Math.sqrt(sumSquaredDiff / data.length);

    return { min, max, mean, std };
  }
}
