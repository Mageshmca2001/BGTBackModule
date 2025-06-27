
import {useEffect} from 'react';

import  AdminSidebar  from '../components/AdminRoutes'

import Dashboard from '../Pages/Dashboard';

import BackNavigationBlocker from '../components/block';

const Admin = () => {


    useEffect(() => {
        document.title = 'BGT - admin-Dashboard';
      }, []);

return (
<>

<BackNavigationBlocker />

{/* Sidebar with Dashboard passed as children */}

<AdminSidebar>

<Dashboard/>

</AdminSidebar>

</>

);

};

export default Admin ;
