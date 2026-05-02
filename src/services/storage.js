import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { storage } from "../firebase";
import { db } from "../firebase";

export const uploadProfileImage = async (file, userId) => {
  if (!file) throw new Error("No file selected");
  if (!userId) throw new Error("Missing user id");

  const storageRef = ref(storage, `profileImages/${userId}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};

export const saveProfileImage = async (userId, imageUrl) => {
  if (!userId) throw new Error("Missing user id");
  if (!imageUrl) throw new Error("Missing image url");

  await setDoc(
    doc(db, "users", userId),
    {
      photoURL: imageUrl,
      profile: {
        photoURL: imageUrl,
        profileImage: imageUrl,
      },
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
};
