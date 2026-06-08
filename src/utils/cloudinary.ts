
/// <reference types="vite/client" />
export const uploadToCloudinary = (file: File, type: 'image' | 'video', onProgress: (progress: number) => void): Promise<string | null> => {
    return new Promise((resolve) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
        
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        if (!cloudName || !import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET) {
            console.error("Cloudinary credentials missing");
            resolve(null);
            return;
        }
        
        const url = `https://api.cloudinary.com/v1_1/${cloudName}/${type}/upload`;

        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                onProgress((event.loaded / event.total) * 100);
            }
        };
        xhr.onload = () => {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                resolve(data.secure_url);
            } else {
                console.error("Cloudinary upload failed", xhr.responseText);
                resolve(null);
            }
        };
        xhr.onerror = () => {
            console.error("Cloudinary upload error");
            resolve(null);
        };
        xhr.send(formData);
    });
};
