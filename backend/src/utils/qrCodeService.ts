import QRCode from 'qrcode';

export const generateQRCode = async (text: string): Promise<Buffer> => {
  try {
    return await QRCode.toBuffer(text);
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Could not generate QR code');
  }
};
