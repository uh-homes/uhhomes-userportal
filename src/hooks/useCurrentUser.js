import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { addUser } from "../store/slice/userSlice";
import { fetchCurrentUser } from "../services/authApi";

export default function useCurrentUser() {
  const dispatch = useDispatch();
  const user = useSelector((store) => store.user);
  const navigate = useNavigate();

  const getCurrentUser = async () => {
    try {
      if (!user) {
        const fetchedUser = await fetchCurrentUser();
        dispatch(addUser(fetchedUser));
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getCurrentUser();
  }, [user]);
}
