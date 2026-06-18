const GOOGLE_DRIVE_FOLDER_URL =
  process.env.GOOGLE_DRIVE_FOLDER_URL ||
  'https://drive.google.com/drive/folders/1Aty9tVMprF39wyVWIFxzEEO-qPsC0ucQ?usp=sharing';

export default async function handler(_req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=300');

  return res.status(200).json({
    googleDriveFolderUrl: GOOGLE_DRIVE_FOLDER_URL,
  });
}
