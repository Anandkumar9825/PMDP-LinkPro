import React from 'react'
import './loader.css'

const Loader = () => {
  return (
    <div className='fixed top-0 left-0 w-full h-full z-[999] bg-gray-200/70 backdrop-blur-sm flex justify-center items-center'>
      
      <div className="flex flex-col items-center gap-6">

        <p className='loading-text text-lg font-semibold'>
          Loading LinkPro<span className="dots"></span>
        </p>

        <div className="loader">
          <div></div>
          <div></div>
          <div></div>
        </div>

      </div>

    </div>
  )
}

export default Loader