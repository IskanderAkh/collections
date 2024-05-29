import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import useUpdatePost from "../../hooks/useUpdatePost";

const EditPostModal = ({ post, user, }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: "",
    text: "",
    collectionName: "",
    tags: "",
    customFields: "",
    img: "",
  });

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        text: post.text,
        collectionName: post.collectionName,
        tags: post.tags,
        customFields: post.customFields,
        img: post.img,
      });
    }
  }, [post]);

  const { updatePost, isUpdatingPost } = useUpdatePost();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = ({ file }) => {
    if (file.status === "done") {
      setFormData({ ...formData, img: file.response.secure_url });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updatePost({ ...formData, _id: post._id });
    
    document.getElementById("update_post_modal").close();
  };

  return (
    <>
      <button
        className="btn btn-outline rounded-full btn-sm"
        onClick={() => document.getElementById("update_post_modal").showModal()}
      >
        {t("edit-post")}
      </button>
      <dialog id="update_post_modal" className="modal">
        <div className="modal-box border rounded-md border-gray-700 shadow-md">
          <h3 className="font-bold text-lg my-3">{t("update-post")}</h3>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                placeholder={t("title")}
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.title}
                name="title"
                onChange={handleInputChange}
              />
              <input
                type="text"
                placeholder={t("collection-name")}
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.collectionName}
                name="collectionName"
                onChange={handleInputChange}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <textarea
                placeholder={t("text")}
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.text}
                name="text"
                onChange={handleInputChange}
              />
              <input
                type="text"
                placeholder={t("tags")}
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.tags}
                name="tags"
                onChange={handleInputChange}
              />
            </div>
            <textarea
              placeholder={t("custom-fields")}
              className="input border border-gray-700 rounded p-2 input-md"
              value={formData.customFields}
              name="customFields"
              onChange={handleInputChange}
            />
            <button className="btn btn-primary rounded-full btn-sm text-white">
              {isUpdatingPost ? t("updating") : t("update")}
            </button>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button className="outline-none">{t("close")}</button>
        </form>
      </dialog>
    </>
  );
};

export default EditPostModal;
