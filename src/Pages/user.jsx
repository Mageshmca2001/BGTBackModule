
import {useEffect} from 'react';

import  UserSidebar  from '../components/userRoutes';

import Dashboard from '../Pages/Dashboard';

import BackNavigationBlocker from '../components/block';

const User = () => {


useEffect(() => {
    document.title = 'BGT - Users';
  }, []);

return (
<>

<BackNavigationBlocker />

{/* Sidebar with Dashboard passed as children */}

<UserSidebar>

<Dashboard/>

</UserSidebar>

</>

);

};

export default User ;
