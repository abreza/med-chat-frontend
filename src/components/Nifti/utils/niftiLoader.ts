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
    const resp = await fetch(url);
    if (!resp.ok)
      throw new Error(`Failed to fetch NIfTI file: ${resp.statusText}`);
    const arrayBuffer = await resp.arrayBuffer();

    const data = nifti.isCompressed(arrayBuffer)
      ? (nifti.decompress(arrayBuffer) as ArrayBuffer)
      : arrayBuffer;

    if (!nifti.isNIFTI(data)) throw new Error("File is not a valid NIfTI file");

    const header = nifti.readHeader(data);
    const image = nifti.readImage(header, data);

    let typedData: any;
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
  }

  static getSliceData(
    niftiData: NiftiData,
    sliceIndex: number,
    orientation: "axial" | "sagittal" | "coronal" = "axial"
  ): Float32Array {
    const { typedData, dims } = niftiData;
    const [w, h, d] = dims;

    let sliceSize: number;
    let slice: Float32Array;

    switch (orientation) {
      case "axial":
        if (sliceIndex < 0 || sliceIndex >= d)
          throw new Error("axial slice out of range");
        sliceSize = w * h;
        slice = new Float32Array(sliceSize);
        slice.set(
          typedData.subarray(
            sliceIndex * sliceSize,
            (sliceIndex + 1) * sliceSize
          )
        );
        return slice;
      case "sagittal": {
        if (sliceIndex < 0 || sliceIndex >= w)
          throw new Error("sagittal slice out of range");
        sliceSize = h * d;
        slice = new Float32Array(sliceSize);
        let i = 0;
        for (let z = 0; z < d; z++) {
          for (let y = 0; y < h; y++) {
            slice[i++] = typedData[sliceIndex + y * w + z * w * h];
          }
        }
        return slice;
      }
      case "coronal": {
        if (sliceIndex < 0 || sliceIndex >= h)
          throw new Error("coronal slice out of range");
        sliceSize = w * d;
        slice = new Float32Array(sliceSize);
        let i = 0;
        for (let z = 0; z < d; z++) {
          for (let x = 0; x < w; x++) {
            slice[i++] = typedData[x + sliceIndex * w + z * w * h];
          }
        }
        return slice;
      }
    }
  }

  static normalizeIntensity(data: Float32Array): Uint8ClampedArray {
    if (!data.length) return new Uint8ClampedArray(0);
    let min = data[0],
      max = data[0];
    for (let i = 1; i < data.length; i++) {
      const v = data[i];
      if (v < min) min = v;
      if (v > max) max = v;
    }
    const range = max - min || 1;
    const out = new Uint8ClampedArray(data.length);
    for (let i = 0; i < data.length; i++)
      out[i] = Math.round(((data[i] - min) / range) * 255);
    return out;
  }

  static getIntensityStats(data: Float32Array) {
    if (!data.length) return { min: 0, max: 0, mean: 0, std: 0 };
    let min = data[0],
      max = data[0],
      sum = 0;
    for (const v of data) {
      if (v < min) min = v;
      if (v > max) max = v;
      sum += v;
    }
    const mean = sum / data.length;
    let sq = 0;
    for (const v of data) sq += (v - mean) ** 2;
    return { min, max, mean, std: Math.sqrt(sq / data.length) };
  }
}
