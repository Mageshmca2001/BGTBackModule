// src/components/Unauthorized.js

import {useEffect} from 'react';

const Unauthorized = () => {

  useEffect(() => {
    document.title = 'BGT - unathorized';
  }, []);

  
return (
<div 
style={{
display: 'flex',
justifyContent: 'center',
alignItems: 'center',
height: '100vh',
textAlign: 'center',
flexDirection: 'column'
}}
>
<h1 className=" text-4xl font-semibold text-blue-500 mb-2 ">Unauthorized Access</h1>

<p className=" text-4xl text-blue-600 mb-2  ">You do not have permission to access this page.</p>

<p className=" text-4xl text-blue-600 mb-2  ">Please contact the administrator </p>



<p className=" text-4xl text-blue-600 mb-2 ">thank you 😊</p>

</div>

  );
  
};

export default Unauthorized;
