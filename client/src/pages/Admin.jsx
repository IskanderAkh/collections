import React from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from "react-hot-toast";

const AdminPanel = () => {
  const USERS_GATEWAY = '/api/users/all';
  const queryClient = useQueryClient();

  const { data: users, isLoading, isError } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await axios.get(USERS_GATEWAY);
      return response.data;
    }
  });

  const mutation = useMutation({
    mutationFn: async ({ userId, action }) => {
      const response = await axios.post('/api/users/action', { userId, action });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Action performed successfully.');
      queryClient.invalidateQueries(['users']);
    },
    onError: () => {
      toast.error('Error performing action.');
    }
  });

  const handleAction = (userId, action) => {
    mutation.mutate({ userId, action });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading users.</div>;
  }

  return (
    <div>
      <h1>Admin Panel</h1>
      <table className='table'>
        <thead>
          <tr>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr className='hover' key={user._id}>
              <td>{user.email}</td>
              <td className='flex gap-5'>
                <button onClick={() => handleAction(user._id, 'block')}>Block</button>
                <button onClick={() => handleAction(user._id, 'unblock')}>Unblock</button>
                <button onClick={() => handleAction(user._id, 'delete')}>Delete</button>
                <button onClick={() => handleAction(user._id, 'makeAdmin')}>Make Admin</button>
                <button onClick={() => handleAction(user._id, 'removeAdmin')}>Remove Admin</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPanel;
