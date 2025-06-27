// Loading.jsx
import React from 'react';

const Loading = () => {
  return (
    
    <div id="spinner-container"className="flex justify-center items-center h-screen">
   
    <div className="space-y-4 text-center">
        <div className="flex justify-center space-x-1">
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce delay-100"></div>
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce delay-200"></div>
        </div>

        <div className="text-blue-500 text-xl mt-4">Please Wait...</div>
    </div>
</div>

  );
};

export default Loading;