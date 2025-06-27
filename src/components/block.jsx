import React, { useEffect } from "react";

import { useNavigate } from "react-router-dom";


const BackNavigationBlocker = ({ children }) => {

const navigate = useNavigate();

useEffect(() => {

const handlePopState = (event) => {

navigate(1); // Prevent going back

};

window.addEventListener("popstate", handlePopState);


return () => {

window.removeEventListener("popstate", handlePopState);

};

}, [navigate]);

return <>{children}</>;
};

export default BackNavigationBlocker;
