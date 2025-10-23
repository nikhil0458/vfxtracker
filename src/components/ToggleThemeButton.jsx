import React from 'react';
import { Button } from 'antd';

import { HiOutlineSun, HiOutlineMoon } from 'react-icons/hi';



const ToggleThemeButton = ( { darkTheme, toggleTheme}) => {
    return (  
        <div className='toggle-theme-button'  
        style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '16px 0',
          }}>
            <Button onClick={toggleTheme} 
             style={{
                background: 'none',
                border: 'none',
                boxShadow: 'none',
                fontSize: '20px',
                color: darkTheme ? '#fff' : '#000', // theme-based color
              }}
            
            >
                { darkTheme ? <HiOutlineSun /> :
                <HiOutlineMoon />
                }
            </Button>

        </div>
    );
}
 
export default ToggleThemeButton;