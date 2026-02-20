import { Buffer } from 'node:buffer';
import { Cacheable } from 'cacheable';
import { HookifiedOptions, Hookified } from 'hookified';

declare enum QrBitEvents {
    warn = "warn",
    info = "info",
    error = "error"
}
type QrOptions = {
    /**
     * The text content to encode in the QR code. It can be text or a url.
     * @type {string}
     */
    text: string;
    /**
     * The size of the QR code in pixels.
     * @type {number}
     * @default 200
     */
    size?: number;
    /**
     * The margin around the QR code in pixels.
     * @type {number}
     */
    margin?: number;
    /**
     * The logo to embed in the QR code.
     * @type {string | Buffer}
     */
    logo?: string | Buffer;
    /**
     * The logo size ratio relative to QR code size.
     * @type {number}
     * @default 0.2
     */
    logoSizeRatio?: number;
    /**
     * The background color of the QR code.
     * @type {string}
     * @default "#FFFFFF"
     */
    backgroundColor?: string;
    /**
     * The foreground color of the QR code.
     * @type {string}
     * @default "#000000"
     */
    foregroundColor?: string;
    /**
     * The error correction level of the QR code.
     * @type {"L" | "M" | "Q" | "H"}
     * @default "M"
     */
    errorCorrection?: "L" | "M" | "Q" | "H";
    /**
     * Caching is enabled by default. You can disable it by setting this option to false. You can also pass
     * a custom Cacheable instance.
     * @type {Cacheable | boolean}
     * @default true
     */
    cache?: Cacheable | boolean;
} & HookifiedOptions;
interface QrResult {
    svg?: string;
    png?: Buffer;
    width: number;
    height: number;
}
type toOptions = {
    cache?: boolean;
    quality?: number;
};
/**
 * QR code generator with logo support and caching capabilities.
 * Supports both file path and buffer-based logos with automatic optimization.
 */
declare class QrBit extends Hookified {
    private _text;
    private _size;
    private _margin;
    private _logo;
    private _logoSizeRatio;
    private _backgroundColor;
    private _foregroundColor;
    private _errorCorrection;
    private _cache;
    private _napi;
    /**
     * Create a new QrBit instance.
     * @param options - Configuration options for the QR code
     */
    constructor(options: QrOptions);
    /**
     * Get the text content for the QR code.
     * @returns {string} The text content
     */
    get text(): string;
    /**
     * Set the text content for the QR code.
     * @param value - The text content to encode
     */
    set text(value: string);
    /**
     * Get the size of the QR code in pixels.
     * @returns {number} The size in pixels
     * @default 200
     */
    get size(): number;
    /**
     * Set the size of the QR code in pixels.
     * @param value - The size in pixels
     */
    set size(value: number);
    /**
     * Get the margin around the QR code in pixels.
     * @returns {number | undefined} The margin in pixels
     */
    get margin(): number | undefined;
    /**
     * Set the margin around the QR code in pixels.
     * @param value - The margin in pixels
     */
    set margin(value: number | undefined);
    /**
     * Get the logo path or buffer.
     * @returns {string | Buffer | undefined} The logo path, buffer, or undefined if no logo
     * @default undefined
     */
    get logo(): string | Buffer | undefined;
    /**
     * Set the logo as a file path or buffer.
     * @param value - The logo file path, buffer, or undefined to remove logo
     */
    set logo(value: string | Buffer | undefined);
    /**
     * Get the logo size ratio relative to QR code size.
     * @returns {number} The logo size ratio
     * @default 0.2
     */
    get logoSizeRatio(): number;
    /**
     * Set the logo size ratio relative to QR code size.
     * @param value - The logo size ratio (0.0 to 1.0)
     */
    set logoSizeRatio(value: number);
    /**
     * Get the background color of the QR code.
     * @returns {string} The background color in hex format
     * @default "#FFFFFF"
     */
    get backgroundColor(): string;
    /**
     * Set the background color of the QR code.
     * @param value - The background color in hex format (e.g., "#FFFFFF")
     */
    set backgroundColor(value: string);
    /**
     * Get the foreground color of the QR code.
     * @returns {string} The foreground color in hex format
     * @default "#000000"
     */
    get foregroundColor(): string;
    /**
     * Set the foreground color of the QR code.
     * @param value - The foreground color in hex format (e.g., "#000000")
     */
    set foregroundColor(value: string);
    /**
     * Get the error correction level of the QR code.
     * @returns {"L" | "M" | "Q" | "H"} The error correction level
     * @default "M"
     */
    get errorCorrection(): "L" | "M" | "Q" | "H";
    /**
     * Set the error correction level of the QR code.
     * @param value - The error correction level (L, M, Q, H)
     */
    set errorCorrection(value: "L" | "M" | "Q" | "H");
    /**
     * Get the cache instance.
     * @returns {Cacheable | undefined} The cache instance or undefined if caching is disabled
     */
    get cache(): Cacheable | undefined;
    /**
     * Set the cache instance.
     * @param value - The cache instance or undefined to disable caching
     */
    set cache(value: Cacheable | undefined);
    /**
     * Generate SVG QR code with optional caching.
     * Uses QRCode library for simple cases, Rust implementation for logos.
     * @param {toOptions} options - Generation options whether to use caching (default: true)
     * @returns {Promise<string>} The SVG string
     */
    toSvg(options?: toOptions): Promise<string>;
    /**
     * Generate SVG QR code using the native Rust implementation.
     * Automatically chooses between file path and buffer functions.
     * @returns {Promise<string>} The SVG string
     */
    toSvgNapi(): Promise<string>;
    /**
     * Generate PNG QR code with optional caching.
     * Generates the QR as Svg either in rust if it has a logo or native. Then does a conversion on it.
     * @param options - Generation options
     * @param options.cache - Whether to use caching (default: true)
     * @returns {Promise<Buffer>} The PNG buffer
     */
    toPng(options?: toOptions): Promise<Buffer>;
    /**
     * Generate PNG QR code and save it to a file.
     * Creates directories if they don't exist.
     * @param filePath - The file path where to save the PNG
     * @param options - Generation options
     * @param options.cache - Whether to use caching (default: true)
     * @returns {Promise<void>} Resolves when file is written
     */
    toPngFile(filePath: string, options?: toOptions): Promise<void>;
    /**
     * Generate JPEG QR code with optional caching.
     * Generates the QR as SVG either in rust if it has a logo or native. Then does a conversion on it.
     * @param options - Generation options
     * @param options.cache - Whether to use caching (default: true)
     * @param options.quality - JPEG quality 1-100 (default: 90)
     * @returns {Promise<Buffer>} The JPEG buffer
     */
    toJpg(options?: toOptions): Promise<Buffer>;
    /**
     * Generate JPEG QR code and save it to a file.
     * Creates directories if they don't exist.
     * @param filePath - The file path where to save the JPEG
     * @param options - Generation options
     * @param options.cache - Whether to use caching (default: true)
     * @param options.quality - JPEG quality 1-100 (default: 90)
     * @returns {Promise<void>} Resolves when file is written
     */
    toJpgFile(filePath: string, options?: toOptions): Promise<void>;
    /**
     * Generate WebP QR code with optional caching.
     * Generates the QR as SVG either in rust if it has a logo or native. Then does a conversion on it.
     * Note: WebP encoding uses lossless compression - quality parameter is reserved for future lossy support.
     * @param options - Generation options
     * @param options.cache - Whether to use caching (default: true)
     * @param options.quality - Reserved for future lossy WebP support (currently ignored)
     * @returns {Promise<Buffer>} The WebP buffer
     */
    toWebp(options?: toOptions): Promise<Buffer>;
    /**
     * Generate WebP QR code and save it to a file.
     * Creates directories if they don't exist.
     * @param filePath - The file path where to save the WebP
     * @param options - Generation options
     * @param options.cache - Whether to use caching (default: true)
     * @param options.quality - Reserved for future lossy WebP support (currently ignored)
     * @returns {Promise<void>} Resolves when file is written
     */
    toWebpFile(filePath: string, options?: toOptions): Promise<void>;
    /**
     * Generate SVG QR code and save it to a file.
     * Creates directories if they don't exist.
     * @param filePath - The file path where to save the SVG
     * @param options - Generation options
     * @param options.cache - Whether to use caching (default: true)
     * @returns {Promise<void>} Resolves when file is written
     */
    toSvgFile(filePath: string, options?: toOptions): Promise<void>;
    /**
     * Convert SVG content to PNG buffer using the native Rust implementation.
     * @param svgContent - The SVG content as a string
     * @param width - Optional width for the PNG output
     * @param height - Optional height for the PNG output
     * @returns {Buffer} The PNG buffer
     */
    static convertSvgToPng(svgContent: string, width?: number, height?: number): Buffer;
    /**
     * Convert SVG content to JPEG buffer using the native Rust implementation.
     * @param svgContent - The SVG content as a string
     * @param width - Optional width for the JPEG output
     * @param height - Optional height for the JPEG output
     * @param quality - Optional JPEG quality 1-100 (default: 90)
     * @returns {Buffer} The JPEG buffer
     */
    static convertSvgToJpeg(svgContent: string, width?: number, height?: number, quality?: number): Buffer;
    /**
     * Convert SVG content to WebP buffer using the native Rust implementation.
     * Note: WebP encoding uses lossless compression - quality parameter is reserved for future lossy support.
     * @param svgContent - The SVG content as a string
     * @param width - Optional width for the WebP output
     * @param height - Optional height for the WebP output
     * @param quality - Reserved for future lossy WebP support (currently ignored)
     * @returns {Buffer} The WebP buffer
     */
    static convertSvgToWebp(svgContent: string, width?: number, height?: number, quality?: number): Buffer;
    /**
     * Generate a cache key based on the current QR code options.
     * @param {string} renderKey the format that you are rendering in such as `napi-png`, `native-svg`, `napi-svg`
     * @returns {Promise<string>} The cache key
     */
    generateCacheKey(renderKey: string): Promise<string>;
    /**
     * Check if the logo is a string (file path).
     * @returns {boolean} True if logo is a string, false otherwise
     */
    isLogoString(): boolean;
    /**
     * Check if a logo file exists at the specified path.
     * @param filePath - The file path to check
     * @returns {Promise<boolean>} True if file exists, false otherwise
     */
    logoFileExists(filePath: string): Promise<boolean>;
}

export { QrBit, QrBitEvents, type QrOptions, type QrResult, type toOptions };
