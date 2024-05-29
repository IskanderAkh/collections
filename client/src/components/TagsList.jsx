import React from 'react'
import { Link } from 'react-router-dom';

const TagsList = ({ tags, isAdmin, isMyProfile, }) => {
   
    
    return (
        <div className='grid grid-cols-2 gap-4 mb-10 md:grid-cols-3 xl:grid-cols-4'>
            {tags.map((tag, i) => (
                <Link className='link font-medium text-xl cursor-pointer' to={{ pathname: `/tag/${tag}` }} state={{tag:tag, isAdmin, isMyProfile}} tag={tag} key={i}>{tag}</Link>
            ))}
        </div>
    )
}

export default TagsList