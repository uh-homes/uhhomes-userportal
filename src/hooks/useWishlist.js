import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef } from "react";
import api from "../Api/api";
import { setWishlist } from "../store/slice/wishlistSlice";

export default function useWishlist() {
  const dispatch = useDispatch();
  const wishlist = useSelector((store) => store?.wishlist);
  const user = useSelector((store) => store?.user);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!user || hasFetched.current) return;
    if (wishlist?.length > 0) return;
    hasFetched.current = true;

    const getWishlist = async () => {
      try {
        const allWishlist = await api.get(`/favorites`);
        dispatch(setWishlist(allWishlist.data.data));
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      }
    };

    getWishlist();
  }, [user, wishlist, dispatch]);
}
