import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { menuItems1 } from "../fooddata";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cartItems: {},
    totalAmount: 0,
  },
  reducers: {
    addToCart: (state, action) => {
      const itemId  = action.payload;
      const cart = state.cartItems;
      const updatedCart = { ...cart };
      updatedCart[itemId] = (updatedCart[itemId] || 0) + 1;
      state.cartItems = updatedCart;

      const item = menuItems1.find((item) => item.id === itemId);
      state.totalAmount = state.totalAmount + item.price;
    },

    removeFromCart: (state, action) => {
      const cart = {...state.cartItems};
      const itemId = action.payload;
      console.log(cart)
      console.log(itemId)
      if (cart[itemId] > 0) {
        const updatedCart = { ...cart };
        updatedCart[itemId] -= 1;
        if (updatedCart[itemId] === 0) {
          delete updatedCart[itemId];
        }
        // setCart(updatedCart);
        state.cartItems = updatedCart;

        const item = menuItems1.find((item) => item.id === itemId);
        // setTotalAmount((prevTotal) => prevTotal - item.price);
        state.totalAmount = state.totalAmount - item.price;
      }
    },
  },
});

export const { addToCart, removeFromCart } = cartSlice.actions;
export default cartSlice.reducer;