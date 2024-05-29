import { useMutation, useQueryClient } from '@tanstack/react-query';
import React from 'react'
import toast from 'react-hot-toast';
import { MdDelete } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const DeleteCollection = ({ collection }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { mutate: deleteCollection, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/collections/${collection._id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error('Error deleting post');
      } catch (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      // console.log('lll');
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Collection deleted successfully");
      navigate('/collections')
    }
  });
  return (
    <div>
      <button className="btn" onClick={() => document.getElementById('my_modal_5').showModal()}>Delete Collection</button>
      <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-black">Hello!</h3>
          <p className="py-4 text-black">Are you sure you want to delete this collection?</p>
          <div className="modal-action w-full flex justify-between">
            <button className="btn btn-danger" onClick={deleteCollection}>
              Delete Collection <MdDelete />
            </button>
            <form method="dialog w-full">
              <div className='w-full flex justify-between  '>
                <button className="btn">Close</button>
              </div>
            </form>
          </div>
        </div>
      </dialog>

    </div>
  )
}

export default DeleteCollection