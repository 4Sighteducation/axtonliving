export default async function handler(_req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=300');

  return res.status(200).json({
    googleDriveFolderUrl: process.env.GOOGLE_DRIVE_FOLDER_URL || '',
  });
}
