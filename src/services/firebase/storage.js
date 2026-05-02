import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { toast } from "react-hot-toast";

const storage = getStorage();

export async function uploadProfileImage(userId, file) {
  if (!file || !userId) {
    throw new Error("Missing file or userId");
  }

  try {
    const fileName = `${userId}_${Date.now()}`;
    const storageRef = ref(storage, `profile-images/${userId}/${fileName}`);

    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);

    return downloadUrl;
  } catch (error) {
    console.error("Upload error:", error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
}

export async function deleteProfileImage(userId, imageUrl) {
  if (!imageUrl || !userId) return;

  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error) {
    console.error("Delete error:", error);
  }
}
