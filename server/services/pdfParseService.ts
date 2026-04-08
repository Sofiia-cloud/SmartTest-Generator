import pdfParse from 'pdf-parse';
import fs from 'fs';

/**
 * Extract text content from a PDF file
 * @param filePath - Path to the PDF file
 * @returns Extracted text content from the PDF
 */
export const extractPdfContent = async (filePath: string): Promise<string> => {
  try {
    console.log(`Extracting PDF content from: ${filePath}`);

    const pdfBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(pdfBuffer);

    const content = pdfData.text || '';
    console.log(`Successfully extracted ${content.length} characters from PDF`);

    return content;
  } catch (error) {
    console.error(`Error extracting PDF content: ${error}`);
    throw new Error(`Failed to extract PDF content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Get PDF metadata without extracting full text
 * @param filePath - Path to the PDF file
 * @returns PDF metadata including page count
 */
export const getPdfMetadata = async (filePath: string): Promise<{ pages: number }> => {
  try {
    const pdfBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(pdfBuffer);

    return {
      pages: pdfData.numpages || 0,
    };
  } catch (error) {
    console.error(`Error getting PDF metadata: ${error}`);
    throw new Error(`Failed to get PDF metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
