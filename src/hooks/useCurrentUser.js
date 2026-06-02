import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef } from "react";
import { addUser } from "../store/slice/userSlice";
import { fetchCurrentUser } from "../services/authApi";

export default function useCurrentUser() {
  const dispatch = useDispatch();
  const user = useSelector((store) => store.user);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (user || hasFetched.current) return;
    hasFetched.current = true;

    const getCurrentUser = async () => {
      try {
        const fetchedUser = await fetchCurrentUser();
        dispatch(addUser(fetchedUser));
      } catch (error) {
        // User is not authenticated — silently ignore
      }
    };

    getCurrentUser();
  }, [user, dispatch]);
}
