// src/qrbit.ts
import { Buffer } from "buffer";
import fs from "fs";
import path from "path";
import { Cacheable } from "cacheable";
import { Hookified } from "hookified";
import QRCode from "qrcode";
import {
  convertSvgToJpeg as nativeConvertSvgToJpeg,
  convertSvgToPng as nativeConvertSvgToPng,
  convertSvgToWebp as nativeConvertSvgToWebp,
  generateQrSvg as nativeGenerateQrSvg,
  generateQrSvgWithBuffer as nativeGenerateQrSvgWithBuffer
} from "./native.js";
var QrBitEvents = /* @__PURE__ */ ((QrBitEvents2) => {
  QrBitEvents2["warn"] = "warn";
  QrBitEvents2["info"] = "info";
  QrBitEvents2["error"] = "error";
  return QrBitEvents2;
})(QrBitEvents || {});
var logoFileDoesNotExistMessage = (logo) => `Logo file not found: ${logo}. Proceeding without logo.`;
var QrBit = class _QrBit extends Hookified {
  /**
   * Create a new QrBit instance.
   * @param options - Configuration options for the QR code
   */
  constructor(options) {
    super();
    this._napi = {
      convertSvgToJpeg: nativeConvertSvgToJpeg,
      convertSvgToPng: nativeConvertSvgToPng,
      convertSvgToWebp: nativeConvertSvgToWebp,
      generateQrSvg: nativeGenerateQrSvg,
      generateQrSvgWithBuffer: nativeGenerateQrSvgWithBuffer
    };
    this._text = options.text;
    this._size = options.size ?? 200;
    this._margin = options.margin ?? void 0;
    this._logo = options.logo;
    this._logoSizeRatio = options.logoSizeRatio ?? 0.2;
    this._backgroundColor = options.backgroundColor ?? "#FFFFFF";
    this._foregroundColor = options.foregroundColor ?? "#000000";
    this._errorCorrection = options.errorCorrection ?? "M";
    if (options.cache !== void 0) {
      if (options.cache === true) {
        this._cache = new Cacheable();
      } else if (options.cache !== false) {
        this._cache = options.cache;
      }
    } else {
      this._cache = new Cacheable();
    }
    this.throwOnEmitError = true;
  }
  /**
   * Get the text content for the QR code.
   * @returns {string} The text content
   */
  get text() {
    return this._text;
  }
  /**
   * Set the text content for the QR code.
   * @param value - The text content to encode
   */
  set text(value) {
    this._text = value;
  }
  /**
   * Get the size of the QR code in pixels.
   * @returns {number} The size in pixels
   * @default 200
   */
  get size() {
    return this._size;
  }
  /**
   * Set the size of the QR code in pixels.
   * @param value - The size in pixels
   */
  set size(value) {
    this._size = value;
  }
  /**
   * Get the margin around the QR code in pixels.
   * @returns {number | undefined} The margin in pixels
   */
  get margin() {
    return this._margin;
  }
  /**
   * Set the margin around the QR code in pixels.
   * @param value - The margin in pixels
   */
  set margin(value) {
    this._margin = value;
  }
  /**
   * Get the logo path or buffer.
   * @returns {string | Buffer | undefined} The logo path, buffer, or undefined if no logo
   * @default undefined
   */
  get logo() {
    return this._logo;
  }
  /**
   * Set the logo as a file path or buffer.
   * @param value - The logo file path, buffer, or undefined to remove logo
   */
  set logo(value) {
    this._logo = value;
  }
  /**
   * Get the logo size ratio relative to QR code size.
   * @returns {number} The logo size ratio
   * @default 0.2
   */
  get logoSizeRatio() {
    return this._logoSizeRatio;
  }
  /**
   * Set the logo size ratio relative to QR code size.
   * @param value - The logo size ratio (0.0 to 1.0)
   */
  set logoSizeRatio(value) {
    this._logoSizeRatio = value;
  }
  /**
   * Get the background color of the QR code.
   * @returns {string} The background color in hex format
   * @default "#FFFFFF"
   */
  get backgroundColor() {
    return this._backgroundColor;
  }
  /**
   * Set the background color of the QR code.
   * @param value - The background color in hex format (e.g., "#FFFFFF")
   */
  set backgroundColor(value) {
    this._backgroundColor = value;
  }
  /**
   * Get the foreground color of the QR code.
   * @returns {string} The foreground color in hex format
   * @default "#000000"
   */
  get foregroundColor() {
    return this._foregroundColor;
  }
  /**
   * Set the foreground color of the QR code.
   * @param value - The foreground color in hex format (e.g., "#000000")
   */
  set foregroundColor(value) {
    this._foregroundColor = value;
  }
  /**
   * Get the error correction level of the QR code.
   * @returns {"L" | "M" | "Q" | "H"} The error correction level
   * @default "M"
   */
  get errorCorrection() {
    return this._errorCorrection;
  }
  /**
   * Set the error correction level of the QR code.
   * @param value - The error correction level (L, M, Q, H)
   */
  set errorCorrection(value) {
    this._errorCorrection = value;
  }
  /**
   * Get the cache instance.
   * @returns {Cacheable | undefined} The cache instance or undefined if caching is disabled
   */
  get cache() {
    return this._cache;
  }
  /**
   * Set the cache instance.
   * @param value - The cache instance or undefined to disable caching
   */
  set cache(value) {
    this._cache = value;
  }
  /**
   * Generate SVG QR code with optional caching.
   * Uses QRCode library for simple cases, Rust implementation for logos.
   * @param {toOptions} options - Generation options whether to use caching (default: true)
   * @returns {Promise<string>} The SVG string
   */
  async toSvg(options) {
    let result = "";
    let renderKey = `native-svg`;
    if (this._logo) {
      renderKey = `napi-svg`;
    }
    const qrOptions = {
      text: this._text,
      size: this._size,
      margin: this._margin,
      logo: this._logo,
      logoSizeRatio: this._logoSizeRatio,
      backgroundColor: this._backgroundColor,
      foregroundColor: this._foregroundColor
    };
    if (this._cache && options?.cache !== false) {
      const key = await this.generateCacheKey(renderKey);
      const cached = await this._cache.get(key);
      if (cached) {
        return cached;
      }
    }
    if (!this._logo) {
      const qrCodeOptions = {
        type: "svg",
        width: qrOptions.size,
        errorCorrectionLevel: this._errorCorrection,
        color: {
          dark: qrOptions.foregroundColor,
          light: qrOptions.backgroundColor
        }
      };
      result = await QRCode.toString(this._text, qrCodeOptions);
    } else {
      result = await this.toSvgNapi();
    }
    if (this._cache && options?.cache !== false) {
      const key = await this.generateCacheKey(renderKey);
      await this._cache.set(key, result);
    }
    return result;
  }
  /**
   * Generate SVG QR code using the native Rust implementation.
   * Automatically chooses between file path and buffer functions.
   * @returns {Promise<string>} The SVG string
   */
  async toSvgNapi() {
    if (this._logo && Buffer.isBuffer(this._logo)) {
      const nativeOptionsBuffer = {
        text: this._text,
        size: this._size,
        margin: this._margin,
        logoBuffer: this._logo,
        logoSizeRatio: this._logoSizeRatio,
        backgroundColor: this._backgroundColor,
        foregroundColor: this._foregroundColor,
        errorCorrection: this._errorCorrection
      };
      return this._napi.generateQrSvgWithBuffer(nativeOptionsBuffer);
    } else {
      const nativeOptions = {
        text: this._text,
        size: this._size,
        margin: this._margin,
        logoPath: this._logo,
        logoSizeRatio: this._logoSizeRatio,
        backgroundColor: this._backgroundColor,
        foregroundColor: this._foregroundColor,
        errorCorrection: this._errorCorrection
      };
      if (this._logo && this.isLogoString()) {
        if (!await this.logoFileExists(this._logo)) {
          this.emit(
            "error" /* error */,
            logoFileDoesNotExistMessage(this._logo)
          );
        }
      }
      return this._napi.generateQrSvg(nativeOptions);
    }
  }
  /**
   * Generate PNG QR code with optional caching.
   * Generates the QR as Svg either in rust if it has a logo or native. Then does a conversion on it.
   * @param options - Generation options
   * @param options.cache - Whether to use caching (default: true)
   * @returns {Promise<Buffer>} The PNG buffer
   */
  async toPng(options) {
    let result;
    const renderKey = `napi-png`;
    if (this._cache && options?.cache !== false) {
      const key = await this.generateCacheKey(renderKey);
      const cached = await this._cache.get(key);
      if (cached) {
        return Buffer.from(cached);
      }
    }
    const svg = await this.toSvg(options);
    result = _QrBit.convertSvgToPng(svg);
    if (this._cache && options?.cache !== false) {
      const key = await this.generateCacheKey(renderKey);
      await this._cache.set(key, result);
    }
    return result;
  }
  /**
   * Generate PNG QR code and save it to a file.
   * Creates directories if they don't exist.
   * @param filePath - The file path where to save the PNG
   * @param options - Generation options
   * @param options.cache - Whether to use caching (default: true)
   * @returns {Promise<void>} Resolves when file is written
   */
  async toPngFile(filePath, options) {
    const pngBuffer = await this.toPng(options);
    const dir = path.dirname(filePath);
    await fs.promises.mkdir(dir, { recursive: true });
    await fs.promises.writeFile(filePath, pngBuffer);
  }
  /**
   * Generate JPEG QR code with optional caching.
   * Generates the QR as SVG either in rust if it has a logo or native. Then does a conversion on it.
   * @param options - Generation options
   * @param options.cache - Whether to use caching (default: true)
   * @param options.quality - JPEG quality 1-100 (default: 90)
   * @returns {Promise<Buffer>} The JPEG buffer
   */
  async toJpg(options) {
    let result;
    const quality = options?.quality ?? 90;
    const renderKey = `napi-jpeg-${quality}`;
    if (this._cache && options?.cache !== false) {
      const key = await this.generateCacheKey(renderKey);
      const cached = await this._cache.get(key);
      if (cached) {
        return Buffer.from(cached);
      }
    }
    const svg = await this.toSvg(options);
    result = _QrBit.convertSvgToJpeg(svg, void 0, void 0, quality);
    if (this._cache && options?.cache !== false) {
      const key = await this.generateCacheKey(renderKey);
      await this._cache.set(key, result);
    }
    return result;
  }
  /**
   * Generate JPEG QR code and save it to a file.
   * Creates directories if they don't exist.
   * @param filePath - The file path where to save the JPEG
   * @param options - Generation options
   * @param options.cache - Whether to use caching (default: true)
   * @param options.quality - JPEG quality 1-100 (default: 90)
   * @returns {Promise<void>} Resolves when file is written
   */
  async toJpgFile(filePath, options) {
    const jpegBuffer = await this.toJpg(options);
    const dir = path.dirname(filePath);
    await fs.promises.mkdir(dir, { recursive: true });
    await fs.promises.writeFile(filePath, jpegBuffer);
  }
  /**
   * Generate WebP QR code with optional caching.
   * Generates the QR as SVG either in rust if it has a logo or native. Then does a conversion on it.
   * Note: WebP encoding uses lossless compression - quality parameter is reserved for future lossy support.
   * @param options - Generation options
   * @param options.cache - Whether to use caching (default: true)
   * @param options.quality - Reserved for future lossy WebP support (currently ignored)
   * @returns {Promise<Buffer>} The WebP buffer
   */
  async toWebp(options) {
    let result;
    const quality = options?.quality ?? 90;
    const renderKey = `napi-webp-${quality}`;
    if (this._cache && options?.cache !== false) {
      const key = await this.generateCacheKey(renderKey);
      const cached = await this._cache.get(key);
      if (cached) {
        return Buffer.from(cached);
      }
    }
    const svg = await this.toSvg(options);
    result = _QrBit.convertSvgToWebp(svg);
    if (this._cache && options?.cache !== false) {
      const key = await this.generateCacheKey(renderKey);
      await this._cache.set(key, result);
    }
    return result;
  }
  /**
   * Generate WebP QR code and save it to a file.
   * Creates directories if they don't exist.
   * @param filePath - The file path where to save the WebP
   * @param options - Generation options
   * @param options.cache - Whether to use caching (default: true)
   * @param options.quality - Reserved for future lossy WebP support (currently ignored)
   * @returns {Promise<void>} Resolves when file is written
   */
  async toWebpFile(filePath, options) {
    const webpBuffer = await this.toWebp(options);
    const dir = path.dirname(filePath);
    await fs.promises.mkdir(dir, { recursive: true });
    await fs.promises.writeFile(filePath, webpBuffer);
  }
  /**
   * Generate SVG QR code and save it to a file.
   * Creates directories if they don't exist.
   * @param filePath - The file path where to save the SVG
   * @param options - Generation options
   * @param options.cache - Whether to use caching (default: true)
   * @returns {Promise<void>} Resolves when file is written
   */
  async toSvgFile(filePath, options) {
    const svgString = await this.toSvg(options);
    const dir = path.dirname(filePath);
    await fs.promises.mkdir(dir, { recursive: true });
    await fs.promises.writeFile(filePath, svgString, "utf8");
  }
  /**
   * Convert SVG content to PNG buffer using the native Rust implementation.
   * @param svgContent - The SVG content as a string
   * @param width - Optional width for the PNG output
   * @param height - Optional height for the PNG output
   * @returns {Buffer} The PNG buffer
   */
  static convertSvgToPng(svgContent, width, height) {
    return nativeConvertSvgToPng(svgContent, width, height);
  }
  /**
   * Convert SVG content to JPEG buffer using the native Rust implementation.
   * @param svgContent - The SVG content as a string
   * @param width - Optional width for the JPEG output
   * @param height - Optional height for the JPEG output
   * @param quality - Optional JPEG quality 1-100 (default: 90)
   * @returns {Buffer} The JPEG buffer
   */
  static convertSvgToJpeg(svgContent, width, height, quality) {
    return nativeConvertSvgToJpeg(svgContent, width, height, quality);
  }
  /**
   * Convert SVG content to WebP buffer using the native Rust implementation.
   * Note: WebP encoding uses lossless compression - quality parameter is reserved for future lossy support.
   * @param svgContent - The SVG content as a string
   * @param width - Optional width for the WebP output
   * @param height - Optional height for the WebP output
   * @param quality - Reserved for future lossy WebP support (currently ignored)
   * @returns {Buffer} The WebP buffer
   */
  static convertSvgToWebp(svgContent, width, height, quality) {
    return nativeConvertSvgToWebp(svgContent, width, height, quality);
  }
  /**
   * Generate a cache key based on the current QR code options.
   * @param {string} renderKey the format that you are rendering in such as `napi-png`, `native-svg`, `napi-svg`
   * @returns {Promise<string>} The cache key
   */
  async generateCacheKey(renderKey) {
    const qrOptions = {
      text: this._text,
      size: this._size,
      margin: this._margin,
      logo: this._logo || void 0,
      logoSizeRatio: this._logoSizeRatio,
      backgroundColor: this._backgroundColor,
      foregroundColor: this._foregroundColor,
      errorCorrection: this._errorCorrection,
      renderKey
    };
    const cache = this._cache || new Cacheable();
    return cache.hash(qrOptions);
  }
  /**
   * Check if the logo is a string (file path).
   * @returns {boolean} True if logo is a string, false otherwise
   */
  isLogoString() {
    return typeof this._logo === "string";
  }
  /**
   * Check if a logo file exists at the specified path.
   * @param filePath - The file path to check
   * @returns {Promise<boolean>} True if file exists, false otherwise
   */
  async logoFileExists(filePath) {
    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
      return true;
    } catch (_error) {
      return false;
    }
  }
};
export {
  QrBit,
  QrBitEvents
};
//# sourceMappingURL=qrbit.js.map