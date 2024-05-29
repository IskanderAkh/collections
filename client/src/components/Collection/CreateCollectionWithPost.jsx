import { CiImageOn } from "react-icons/ci";
import { useRef, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

const CreateCollectionWithPost = () => {

  const location = useLocation();
  const state = location.state;
  const isAdmin = state?.isAdmin;
  const navigate = useNavigate()
  const userId = state?.userId;
  const username = state?.user.username;
  const collectionUserId = state?.userId;
  const [collectionId, setCollectionID] = useState("");
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [collectionName, setCollectionName] = useState("");
  const [img, setImg] = useState(null);
  const [customFields, setCustomFields] = useState({
    integerFields: [],
    stringFields: [],
    textFields: [],
    booleanFields: [],
    dateFields: [],
  });
  const [errors, setErrors] = useState({});
  const imgRef = useRef(null);
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const {
    mutate: createPost,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: async ({ name, text, img, userId, customFields, addedByAdmin, author }) => {
      const defaultImageUrl = "https://res.cloudinary.com/dw9ayz9hr/image/upload/v1715701505/vbdywcgzrn0onhnoot36.png";
      try {
        const res = await fetch("/api/collections/createCwP", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            text,
            img: img || defaultImageUrl,
            title,
            author,
            tags,
            userId,
            addedByAdmin,
            collectionName,
            customFields
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },

    onSuccess: (data) => {
      setText("");
      setCollectionName("");
      setImg(null);
      toast.success("Collection and Post created successfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      navigate(`/profile/${username}`); 
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const clearAllInput = () => {
    setText("");
    setImg(null);
    setTitle("");
    setTags("");
    setCustomFields({
      integerFields: [],
      stringFields: [],
      textFields: [],
      booleanFields: [],
      dateFields: [],
    });
  };

  const validateInputs = () => {
    const newErrors = {};
    if (!title) newErrors.title = t("createpost-title-required");
    if (!text && !img) newErrors.text = t("createpost-text-or-image-required");
    if (!collectionName) newErrors.collectionName = t("createcollection-name-required");
    if (!tags) newErrors.tags = t("createcollection-name-required");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateInputs()) return;
    
    const postUserId = isAdmin ? collectionUserId : userId;
    const isUserAdmin = isAdmin;
   
    const postPayload = {
      name: collectionName,
      text,
      img,
      userId: postUserId,
      customFields,
      author: username,
      addedByAdmin: isUserAdmin,
      collectionName,
      tags,
      title,
    };

    createPost(postPayload);
    imgRef.current.value = null;

    setTimeout(() => {
      clearAllInput();
    }, 1000);
  };

  const handleImgChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCustomFieldChange = (e, fieldType, index) => {
    const { value } = e.target;
    setCustomFields((prevFields) => {
      const newFields = { ...prevFields };
      newFields[fieldType][index] = { ...newFields[fieldType][index], value };
      return newFields;
    });
  };

  const renderCustomFields = () => {
    return (
      <>
        {Object.keys(customFields).map((fieldType) =>
          customFields[fieldType].map((field, index) => (
            <input
              key={`${fieldType}-${index}`}
              type="text"
              placeholder={`Enter ${field.name}`}
              value={field.value}
              onChange={(e) => handleCustomFieldChange(e, fieldType, index)}
            />
          ))
        )}
      </>
    );
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-center my-4 mb-8">{t("createcollection-title")}</h1>
      <div className="flex p-4 items-start gap-4 border border-gray-700">
        <form className="flex flex-col gap-2 w-full" onSubmit={handleSubmit}>
          <textarea
            className="textarea w-full p-0 text-lg resize-none border-none focus:outline-none border-gray-800"
            placeholder={t("createcollection-name")}
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
          />
          {errors.collectionName && <div className="text-red-500">{errors.collectionName}</div>}
          <textarea
            className="textarea w-full p-0 text-lg resize-none border-none focus:outline-none border-gray-800"
            placeholder={t("createpost-title")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {errors.title && <div className="text-red-500">{errors.title}</div>}
          <textarea
            className="textarea w-full p-0 text-lg resize-none border-none focus:outline-none border-gray-800"
            placeholder={t("createpost-description")}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <textarea
            className="textarea w-full p-0 text-lg resize-none border-none focus:outline-none border-gray-800"
            placeholder={t("createpost-tags")}
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          {errors.text && <div className="text-red-500">{errors.text}</div>}
          {img && (
            <div className="relative w-72 mx-auto">
              <IoCloseSharp
                className="absolute top-0 right-0 text-white bg-gray-800 rounded-full w-5 h-5 cursor-pointer"
                onClick={() => {
                  setImg(null);
                  imgRef.current.value = null;
                }}
              />
              <img src={img} className="w-full mx-auto h-72 object-contain rounded" />
            </div>
          )}
          {renderCustomFields()}
          <div className="flex justify-between border-t py-2 border-t-gray-700">
            <div className="flex gap-1 items-center">
              <CiImageOn
                className="fill-primary w-6 h-6 cursor-pointer"
                onClick={() => imgRef.current.click()}
              />
            </div>
            <input type="file" accept="image/*" hidden ref={imgRef} onChange={handleImgChange} />
            <button className="btn btn-primary rounded-full btn-sm text-white px-4">
              {isPending ? `${t("createpost-posting")}` : `${t("createpost-submit")}`}
            </button>
          </div>
          {isError && <div className="text-red-500">{error.message}</div>}
        </form>
      </div>
    </>
  );
};

export default CreateCollectionWithPost;
