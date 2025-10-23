// import React from "react";
// const Logo = () => {

//     return(
//         <div className="logo" style={{display: 'flex', flexDirection:"row", justifyContent:"center", alignItems: 'center', margin: '20px'}}>
//             <div className="logo-icon" style={{ width: "65px", height: "65px" }} >
//             <img 
//             // src='\public\assets\GG_3D_LOGO.jpg'
//             src="/assets/GG_3D_LOGO.jpg" 
//             alt="VFX"
             
//              style={{height:"100%", width:"100%" , objectFit:"contain"}}/>
            
//             </div>

//         </div>
//     )
// }

// export default Logo;
import React from "react";
import "./Logo.css";

const Logo = ({ collapsed }) => {
    const logoSize = collapsed ? "65px" : "85px"; 
    return (
        <div className="logo" style={{ display: 'flex', justifyContent: "center", alignItems: 'center', margin: '10px', background:"transparent" }}>
            <div className="logo-icon" style={{ width: logoSize, height: logoSize ,  transition: "width 0.3s ease-in-out, height 0.3s ease-in-out" }}>
                <img
                    src="/assets/GG_3D_LOGO.jpg"
                    alt="VFX"
                    className="logo-img"
                    // style={{ height: "100%", width: "100%", objectFit: "contain" }}
                    // style={{ height: "100%", width: "100%" ,  transition: "width 0.3s ease, height 0.3s ease"}}
                />
            </div>
        </div>
    );
};

export default Logo;
