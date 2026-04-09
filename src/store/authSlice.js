import {createSlice} from '@reduxjs/toolkit';
import authService from '../services/auth';

const initialState = {
    status: false,
    userData: null
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.userData = action.payload;
            state.status = true;
        },
        setStatus: (state, action) => {
            state.status = action.payload;
        },
        logout: (state) => {
            state.userData = null;
            state.status = false;
        },
        login: (state, action) => {
            state.status = true;
            state.userData = action.payload.userData;
        }
    }
})

export const {setUser, setStatus, logout, login} = authSlice.actions;
export default authSlice.reducer;