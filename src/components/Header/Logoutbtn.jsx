import React from 'react'
import {useDispatch} from 'react-redux'
import {logout} from '../../store/authSlice'
import authService from '../../services/auth'

function LogoutBtn() {
    const dispatch = useDispatch()
    const logoutHandler = async () => {
        try {
            await authService.logout()
            localStorage.removeItem('token')
            dispatch(logout())
            window.location.reload()
        } catch (error) {
            console.error('Logout error:', error)
        }
    }
  return (
    <button
    className='px-4 py-1.5 text-sm font-sans uppercase tracking-widest text-ink-faint hover:text-paper transition-colors min-h-[44px]'
    onClick={logoutHandler}
    >Logout</button>
  )
}

export default LogoutBtn