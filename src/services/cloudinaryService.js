

const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

export const cloudinaryService = {
  /**
   * @param {File} file 
   * @param {String} folder 
   * @returns {Promise<String>} 
   */
  uploadFile: async (file, folder = 'fashion_marketplace/cccd') => {
    if (!file) {
      throw new Error('No file provided');
    }

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      throw new Error(
        'Cloudinary configuration is missing. Please set REACT_APP_CLOUDINARY_CLOUD_NAME and REACT_APP_CLOUDINARY_UPLOAD_PRESET in web-frontend/.env.'
      );
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', folder);

    console.log('Cloudinary upload config:', {
      cloudName: CLOUDINARY_CLOUD_NAME,
      uploadPreset: CLOUDINARY_UPLOAD_PRESET,
      folder,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    });

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const contentType = response.headers.get('content-type');
      const responseBody = contentType && contentType.includes('application/json')
        ? await response.json()
        : await response.text();

      console.log('Cloudinary response:', {
        status: response.status,
        statusText: response.statusText,
        body: responseBody,
      });

      if (!response.ok) {
        const errorMessage = typeof responseBody === 'string'
          ? responseBody
          : responseBody.error?.message || JSON.stringify(responseBody);
        throw new Error(
          `Upload failed: ${response.status} ${response.statusText} - ${errorMessage}`
        );
      }

      return responseBody.secure_url || responseBody.url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Failed to upload image to Cloudinary: ' + error.message);
    }
  },

  /**
   * @param {File[]} files 
   * @param {String} folder 
   * @returns {Promise<String[]>} 
   */
  uploadFiles: async (files, folder = 'fashion_marketplace/cccd') => {
    const uploadPromises = files.map(file => 
      cloudinaryService.uploadFile(file, folder)
    );
    return Promise.all(uploadPromises);
  },
};

export default cloudinaryService;
