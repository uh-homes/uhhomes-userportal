import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slice/userSlice";
import wishlistReducer from "./slice/wishlistSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    wishlist: wishlistReducer,
  },
});
