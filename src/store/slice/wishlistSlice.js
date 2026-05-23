import { createSlice } from "@reduxjs/toolkit";

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: [],
  reducers: {
    setWishlist: (state, action) => {
      return action.payload;
    },
    addWishlist: (state, action) => {
      state.push(action.payload);
    },
    removeWishlist: (state, action) => {
      return state.filter((item) => item.propertyId !== action.payload);
    },
  },
});

export const { setWishlist, removeWishlist, addWishlist } =
  wishlistSlice.actions;
export default wishlistSlice.reducer;
