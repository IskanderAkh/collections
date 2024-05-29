import React from 'react'
import { Link } from 'react-router-dom'

const ModalWithTags = ({ post }) => {
  // Split tags by space or comma
  const tags = post.tags.split(/\s|,/).filter(tag => tag.trim() !== '');

  return (
    <div className='flex gap-2 '>
      {tags.map((tag, index) => (
        <Link to={`/tag/${tag}`} key={index} className="btn btn-outline rounded-" alt="tag">{tag}</Link>
      ))}
    </div>
  )
}

export default ModalWithTags
