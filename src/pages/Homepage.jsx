import React from 'react'
import { Link } from 'react-router-dom'

const Homepage = () => {
  return (
    <div className='flex flex-col items-center justify-center h-screen pt-[100px] p-8 h-[100vh] w-[100%] bg-gray-900'>
      <h2 className='text-4xl font-bold text-center poppins text-zinc-500'>We welcome you at <span className='text-blue-800  boldonse'>BFriend</span> </h2>
      <h3 className='text-2xl mt-2 font-bold text-center poppins text-zinc-500'>That feels us <span className='text-blue-800'>Connected</span>  and <span   className='text-blue-800'>United</span>
       </h3>
       <Link to={'/login'}><button className='mt-4 bg-blue-800 text-white px-4 py-2 rounded cursor-pointer'>Get started</button></Link>
    </div>
  )
}

export default Homepage
