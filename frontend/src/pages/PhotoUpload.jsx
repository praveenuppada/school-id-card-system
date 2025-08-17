import React, { useState } from "react";
import { uploadPhoto } from "../services/teacherService";
import Cropper from "react-easy-crop";
import getCroppedImg from "../utils/imageCrop";

export default function PhotoUpload({ studentId }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [uploading, setUploading] = useState(false);

  const onCropComplete = (_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setImageSrc(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    setUploading(true);
    try {
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels, "image/png");
      const formData = new File([croppedImageBlob], `${studentId}.png`, { type: "image/png" });
      await uploadPhoto(studentId, formData);
      alert("Photo uploaded successfully");
    } catch {
      alert("Failed to upload photo");
    }
    setUploading(false);
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {imageSrc && (
        <div className="relative w-64 h-64 bg-gray-200">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
          <button
            className="mt-2 bg-yellow-500 text-white px-4 py-2 rounded"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      )}
    </div>
  );
}
